#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import figlet from 'figlet';

// El CLI vive en dev-cli/, y los servicios estan una carpeta arriba (la raiz del repo).
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IS_WIN = process.platform === 'win32';

// Servicio obligatorio: no se puede desactivar.
const REQUIRED = 'shell';

// Catalogo de servicios que el CLI sabe levantar.
const FRONTS = {
    shell: {
        label: 'shell — host de Module Federation (:3000)',
        dir: 'shell',
        command: 'pnpm',
        args: ['dev'],
        color: 'magenta',
        required: true,
    },
    'catalogos-front': {
        label: 'catalogos-front - frontend de catalogos (:3002)',
        dir: 'catalogos-front',
        command: 'pnpm',
        args: ['dev'],
        color: 'cyan',
    },
    'operaciones-front': {
        label: 'operaciones-front - frontend de operaciones (:3004)',
        dir: 'operaciones-front',
        command: 'pnpm',
        args: ['dev'],
        color: 'green',
    },
    'auth-front': {
        label: 'auth-front - frontend de autenticacion (:3001)',
        dir: 'auth-front',
        command: 'pnpm',
        args: ['dev'],
        color: 'blue',
    },
    'dashboard-reportes-front': {
        label: 'dashboard-reportes-front - frontend de dashboard y reportes (:3003)',
        dir: 'dashboard-reportes-front',
        command: 'pnpm',
        args: ['dev'],
        color: 'orange',
    },
};

const children = [];

function banner() {
    let art;
    try {
        art = figlet.textSync('MICROFRONTENDS', { font: 'ANSI Shadow' });
    } catch {
        art = 'MICROFRONTENDS';
    }
    console.log(chalk.yellow(art));
    console.log(chalk.bold('  Panel de arranque de  microfrontends\n'));
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
        p.on('exit', () => resolve());
        p.on('error', (err) => {
            console.log(chalk.red(`  ✗ ${tag}: ${err.message}`));
            resolve();
        });
    });
}

function launchService(key) {
    const s = FRONTS[key];
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
    console.log(chalk.yellow('\nApagando microfrontends...'));
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
        name: `${FRONTS[REQUIRED].label} ${chalk.yellow('[obligatorio]')}`,
        value: REQUIRED,
        checked: true,
        disabled: chalk.dim('siempre activo'),
    };

    const optionalChoices = Object.entries(FRONTS)
        .filter(([key]) => key !== REQUIRED)
        .map(([key, s]) => ({ name: s.label, value: key, checked: true }));

    let selected;
    let withCommons;

    if (dry) {
        selected = Object.keys(FRONTS);
        withCommons = false;
    } else {
        selected = await checkbox({
            message: 'Frontends a levantar (espacio = marcar, enter = confirmar):',
            choices: [requiredChoice, ...optionalChoices],
        });
        withCommons = await confirm({
            message: '¿Build a commons (carpeta de recursos compartidos)?',
            default: false,
        });
    }

    // api-gateway SIEMPRE se levanta, elija lo que elija el usuario.
    const toStart = Array.from(new Set([...selected, REQUIRED]));

    console.log(chalk.bold('\nPlan de arranque:'));
    for (const key of toStart) {
        const exists = existsSync(join(ROOT, FRONTS[key].dir));
        const mark = exists ? chalk.green('✓') : chalk.red('✗ (carpeta no existe)');
        const req = FRONTS[key].required ? chalk.yellow(' [obligatorio]') : '';
        console.log(`  ${mark} ${key}${req}`);
    }
    console.log(
        `  ${withCommons ? chalk.green('✓') : chalk.gray('·')} Build a commons`,
    );

    if (dry) {
        console.log(chalk.gray('\n(--dry) No se lanza nada. Solo se muestra el plan.'));
        return;
    }

    // 2) Levantar cada servicio seleccionado.
    console.log('');
    for (const key of toStart) {
        if (!existsSync(join(ROOT, FRONTS[key].dir))) {
            console.log(
                chalk.red(
                    `  ✗ ${key}: no existe la carpeta "${FRONTS[key].dir}", se omite.`,
                ),
            );
            continue;
        }
        launchService(key);
    }

    // 3) Prisma Studio (opcional), sobre el task-service.
    if (withCommons && existsSync(join(ROOT, 'task-service'))) {
        const child = spawnProcess('pnpm', ['--filter', '@nexorute/commons', 'build'], {
            cwd: join(ROOT, 'task-service'),
        });
        const prefix = chalk.blue('[commons]');
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
