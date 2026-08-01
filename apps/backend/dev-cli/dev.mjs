#!/usr/bin/env node
import { spawn } from 'node:child_process';
import net from 'node:net';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import figlet from 'figlet';

// El CLI vive en dev-cli/, y los servicios estan una carpeta arriba (la raiz del repo).
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IS_WIN = process.platform === 'win32';
const PRISMA_BIN = join('.', 'node_modules', '.bin', IS_WIN ? 'prisma.CMD' : 'prisma');

// Servicio obligatorio: no se puede desactivar.
const REQUIRED = 'gateway';

// Catalogo de servicios que el CLI sabe levantar.
const SERVICES = {
    'gateway': {
        label: 'gateway — punto unico de entrada (:5000)',
        dir: 'gateway',
        command: 'pnpm',
        args: ['start:dev'],
        port: 5000,
        color: 'magenta',
        required: true,
    },
    'catalogo-service': {
        label: 'catalogo-service — API de catálogos (:5002)',
        dir: 'services/catalogo-service',
        command: 'pnpm',
        args: ['start:dev'],
        port: 5002,
        docker: true, // levanta Postgres + Redis antes de arrancar
        prismaMigrate: true,
        prismaGenerate: true, // genera @prisma/client antes de compilar en watch
        color: 'cyan',
        seeds: true, // puede ejecutar seeds
    },
    'auth-service': {
        label: 'auth-service — API de autenticación (:5001)',
        dir: 'services/auth-service',
        command: 'pnpm',
        args: ['start:dev'],
        port: 5001,
        prismaMigrate: true,
        prismaGenerate: true, // genera @prisma/client antes de compilar en watch
        color: 'yellow',
        seeds: true, // puede ejecutar seeds
    },
    'operaciones-service': {
        label: 'operaciones-service - API de rutas y viajes (:5003)',
        dir: 'services/operaciones-service',
        command: 'pnpm',
        args: ['start:dev'],
        port: 5003,
        prismaMigrate: true,
        prismaGenerate: true,
        color: 'green',
        seedAlways: true,
    },
    'record-service': {
        label: 'record-service - API de registros (:5004)',
        dir: 'services/record-service',
        command: 'pnpm',
        args: ['start:dev'],
        port: 5004,
        prismaMigrate: true,
        prismaGenerate: true,
        color: 'red'
    },
};

const children = [];

function banner() {
    let art;
    try {
        art = figlet.textSync('MICROSERVICIOS', { font: 'ANSI Shadow' });
    } catch {
        art = 'MICROSERVICIOS';
    }
    console.log(chalk.green(art));
    console.log(chalk.bold('  Panel de arranque de microservicios\n'));
}

function paintFor(color) {
    return chalk[color] ?? chalk.white;
}

// spawn multiplataforma: en Windows pnpm/docker son .cmd y requieren shell.
function spawnProcess(command, args, options = {}) {
    return spawn(command, args, {
        shell: IS_WIN,
        windowsHide: IS_WIN,
        ...options,
    });
}

// Antepone [servicio] a cada linea de log del proceso hijo.
function prefixChunk(prefix, chunk) {
    return chunk
        .toString()
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map((line, i, arr) =>
            i === arr.length - 1 && line === '' ? '' : `${prefix} ${line}`,
        )
        .filter((l) => l !== '')
        .join('\n')
        .concat('\n');
}

function runOnce(command, args, cwd, tag) {
    return new Promise((resolve) => {
        console.log(chalk.gray(`  → ${tag}`));
        const p = spawnProcess(command, args, { cwd, stdio: 'inherit' });
        p.on('exit', (code) => {
            if (code === 0) {
                resolve(true);
                return;
            }
            console.log(chalk.red(`  x ${tag}: termino con codigo ${code}`));
            resolve(false);
        });
        p.on('error', (err) => {
            console.log(chalk.red(`  ✗ ${tag}: ${err.message}`));
            resolve(false);
        });
    });
}

async function runRequired(command, args, cwd, tag) {
    const ok = await runOnce(command, args, cwd, tag);
    if (!ok) {
        throw new Error(`${tag} fallo. Corrige ese paso antes de levantar los servicios.`);
    }
}

function isPortFree(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
            server.close(() => resolve(true));
        });
        server.listen(port, '0.0.0.0');
    });
}

async function assertPortsFree(keys) {
    const busy = [];

    for (const key of keys) {
        const port = SERVICES[key]?.port;
        if (!port) continue;
        const free = await isPortFree(port);
        if (!free) busy.push({ key, port });
    }

    if (busy.length === 0) return;

    console.log(chalk.red('\nHay puertos ocupados. Cierra esos procesos antes de levantar el CLI:\n'));
    for (const item of busy) {
        console.log(chalk.red(`  - ${item.key}: puerto ${item.port}`));
        if (IS_WIN) {
            console.log(chalk.gray(`    Ver PID: netstat -ano | findstr :${item.port}`));
            console.log(chalk.gray('    Apagar: taskkill /PID <PID> /T /F'));
        }
    }

    throw new Error('No se levantaron servicios porque hay puertos ocupados.');
}

function launchService(key) {
    const s = SERVICES[key];
    const paint = paintFor(s.color);
    const prefix = paint(`[${key}]`);
    const child = spawnProcess(s.command, s.args, {
        cwd: join(ROOT, s.dir),
    });
    child.stdout.on('data', (d) => process.stdout.write(prefixChunk(prefix, d)));
    child.stderr.on('data', (d) => process.stderr.write(prefixChunk(prefix, d)));
    child.on('exit', (code) =>
        console.log(`${prefix} ${chalk.red(`proceso terminado (code ${code})`)}`),
    );
    child.on('error', (err) =>
        console.log(`${prefix} ${chalk.red(err.message)}`),
    );
    children.push(child);
    console.log(`${prefix} ${chalk.green('iniciado')}`);
}

function killChild(child) {
    if (!child.pid || child.killed) return;
    if (IS_WIN) {
        // En Windows SIGINT no siempre mata el arbol pnpm → nest → node.
        spawnProcess('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
            stdio: 'ignore',
        });
    } else {
        child.kill('SIGINT');
    }
}

function shutdown() {
    console.log(chalk.yellow('\nApagando servicios...'));
    for (const child of children) {
        killChild(child);
    }
    setTimeout(() => process.exit(0), 500);
}

async function main() {
    banner();

    const dry = process.argv.includes('--dry');

    // Opcion obligatoria: se muestra marcada y deshabilitada (no se puede tocar).
    const requiredChoice = {
        name: `${SERVICES[REQUIRED].label} ${chalk.yellow('[obligatorio]')}`,
        value: REQUIRED,
        checked: true,
        disabled: chalk.dim('siempre activo'),
    };

    const optionalChoices = Object.entries(SERVICES)
        .filter(([key]) => key !== REQUIRED)
        .map(([key, s]) => ({ name: s.label, value: key, checked: true }));

    let selected;
    let withStudio;
    let withSeeds;
    let withCommonsBuild;

    if (dry) {
        selected = Object.keys(SERVICES);
        withStudio = false;
        withSeeds = false;
        withCommonsBuild = false;
    } else {
        selected = await checkbox({
            message: 'Servicios a levantar (espacio = marcar, enter = confirmar):',
            choices: [requiredChoice, ...optionalChoices],
        });
        withCommonsBuild = await confirm({
            message: 'Build de backend commons (@commons/* compartidos)?',
            default: true,
        });
        withStudio = await confirm({
            message: '¿Abrir Prisma Studio (explorador visual de la BD)?',
            default: false,
        });
        withSeeds = await confirm({
            message: '¿Cargar datos de prueba (seeds) de todos los servicios ?',
            default: false,
        });
    }

    // gateway SIEMPRE se levanta, elija lo que elija el usuario.
    const toStart = Array.from(new Set([...selected, REQUIRED]));

    console.log(chalk.bold('\nPlan de arranque:'));
    for (const key of toStart) {
        const exists = existsSync(join(ROOT, SERVICES[key].dir));
        const mark = exists ? chalk.green('✓') : chalk.red('✗ (carpeta no existe)');
        const req = SERVICES[key].required ? chalk.yellow(' [obligatorio]') : '';
        console.log(`  ${mark} ${key}${req}`);
    }
    console.log(
        `  ${withCommonsBuild ? chalk.green('ok') : chalk.gray('-')} Build backend commons`,
    );
    console.log(
        `  ${withStudio ? chalk.green('✓') : chalk.gray('·')} Prisma Studio`,
    );
    console.log(
        `  ${withSeeds ? chalk.green('✓') : chalk.gray('·')} Datos de prueba`,
    );
    if (dry) {
        console.log(chalk.gray('\n(--dry) No se lanza nada. Solo se muestra el plan.'));
        return;
    }

    // 1) Commons compartidos del backend. Si estan viejos, los servicios compilan contra exports obsoletos.
    if (withCommonsBuild && existsSync(join(ROOT, 'commons'))) {
        await runRequired(
            'pnpm',
            ['build:all'],
            join(ROOT, 'commons'),
            'build backend commons (@commons/*)',
        );
    }

    // 2) Docker (Postgres/Redis) para los servicios que lo necesiten.
    for (const key of toStart) {
        const s = SERVICES[key];
        const dockerDir = s.dockerDir ?? s.dir;
        if ((s.docker || s.dockerDir) && existsSync(join(ROOT, dockerDir))) {
            await runRequired(
                'docker',
                ['compose', 'up', '-d'],
                join(ROOT, dockerDir),
                `docker compose up -d (${key})`,
            );
        }
    }

    // 2) Migraciones Prisma para los servicios que lo necesiten.
    for (const key of toStart) {
        const s = SERVICES[key];
        if (s.prismaMigrate && existsSync(join(ROOT, s.dir))) {
            await runRequired(
                PRISMA_BIN,
                ['migrate', 'deploy'],
                join(ROOT, s.dir),
                `prisma migrate deploy (${key})`,
            );
        }
    }

    // 3) Prisma Client para los servicios que lo necesiten.
    for (const key of toStart) {
        const s = SERVICES[key];
        if (s.prismaGenerate && existsSync(join(ROOT, s.dir))) {
            await runRequired(
                PRISMA_BIN,
                ['generate'],
                join(ROOT, s.dir),
                `prisma generate (${key})`,
            );
        }
    }

    // 4) Seeds idempotentes o datos de prueba para los servicios que lo necesiten.
    for (const key of toStart) {
        const s = SERVICES[key];
        if ((s.seedAlways || (withSeeds && s.seeds)) && existsSync(join(ROOT, s.dir))) {
            await runRequired(
                PRISMA_BIN,
                ['db', 'seed'],
                join(ROOT, s.dir),
                `prisma db seed (${key})`,
            );
        }
    }

    // 5) Revisar puertos antes de levantar Nest en watch mode.
    await assertPortsFree(toStart);

    // 6) Levantar cada servicio seleccionado.
    console.log('');
    for (const key of toStart) {
        if (!existsSync(join(ROOT, SERVICES[key].dir))) {
            console.log(
                chalk.red(
                    `  ✗ ${key}: no existe la carpeta "${SERVICES[key].dir}", se omite.`,
                ),
            );
            continue;
        }
        launchService(key);
    }

    // 7) Prisma Studio (opcional), sobre el catalogo-service.
    if (withStudio && existsSync(join(ROOT, SERVICES['catalogo-service'].dir))) {
        const child = spawnProcess('pnpm', ['exec', 'prisma', 'studio'], {
            cwd: join(ROOT, SERVICES['catalogo-service'].dir),
        });
        const prefix = chalk.blue('[prisma-studio]');
        child.stdout.on('data', (d) => process.stdout.write(prefixChunk(prefix, d)));
        child.stderr.on('data', (d) => process.stderr.write(prefixChunk(prefix, d)));
        children.push(child);
        console.log(`${prefix} ${chalk.green('iniciado')}`);
    }

    if (children.length === 0) {
        console.log(chalk.yellow('\nNo se levanto ningun servicio.'));
        return;
    }

    console.log(chalk.gray('\nPresiona Ctrl+C para apagar todo.\n'));
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

main().catch((err) => {
    // Cancelar con Ctrl+C durante los prompts lanza un ExitPromptError.
    if (err?.name === 'ExitPromptError') {
        console.log(chalk.gray('\nCancelado.'));
        process.exit(0);
    }
    console.error(chalk.red(err));
    process.exit(1);
});
