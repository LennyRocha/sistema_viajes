"use client";

import {
  PaperBlock,
  PaperHeader,
  snack,
} from "@nexoroute/commons";
import MainLayout from "../layout/MainLayout";
import { useSidebar } from "../providers/SidebarProvider";
import { ChevronLeft } from "@mui/icons-material";
import Button from "@mui/material/Button";
import Image from "next/image";
import { useDialog } from "../providers/DialogProvider";
import { DialogContentText } from "@mui/material";

function Home() {
  const { showSidebar } = useSidebar();
  const { showDialog } = useDialog();
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans  gap-10 ">
      <PaperHeader
        title="Hola"
        subtitle="Esto es un PaperHeader"
        iconname="home"
        showButton
        leftIcon={<ChevronLeft />}
        buttonTitle="Click me"
        onButtonClick={() =>
          snack.success({
            message: "Button clicked!",
          })
        }
      />
      <Image
        className="dark:invert"
        src="/next.svg"
        alt="Next.js logo"
        width={100}
        height={20}
        priority
      />
      <PaperBlock
        title="Welcome to Next.js!"
        subtitle="This is a subtitle for the PaperBlock component."
      >
        <p className="text-center text-lg">
          This is a PaperBlock component. You can put any
          content you want here.
        </p>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more
            instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </PaperBlock>
      <Button
        variant="contained"
        color="secondary"
        onClick={() =>
          showSidebar({
            title: "Sidebar Title",
            children: <div>Sidebar Content</div>,
          })
        }
      >
        Click me
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() =>
          showDialog({
            title: "Dialog Title",
            content: (
              <DialogContentText>
                {" "}
                Let Google help apps determine location.
                This means sending anonymous location data
                to Google, even when no apps are running.
              </DialogContentText>
            ),
            showCloseButton: true,
            onConfirm: () =>
              console.log("Dialog confirmed"),
            onClose: () => console.log("Dialog closed"),
          })
        }
      >
        Click me
      </Button>
    </div>
  );
}

export default function Hame() {
  return (
    <MainLayout>
      <Home />
    </MainLayout>
  );
}
