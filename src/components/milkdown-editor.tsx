import React, { forwardRef } from "react";
import { Crepe, type CrepeConfig } from "@milkdown/crepe";
import { Milkdown, useEditor } from "@milkdown/react";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

type Props = CrepeConfig & {
  onChange?: (markdown: string, prevMarkdown: string) => void;
};

export const MilkdownEditor = forwardRef<{ getMarkdown: () => string }, Props>(({ onChange, ...props }, ref) => {
  const crepeRef = React.useRef<Crepe | null>(null)

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: "# Title",
      ...props,
    });

    crepeRef.current = crepe

    crepe.on((listener) => {
      listener.markdownUpdated((_, markdown, prevMarkdown) => {
        onChange?.(markdown, prevMarkdown);
      })
    })

    return crepe;
  }, [onChange]);

  // Expose getMarkdown via ref
  React.useImperativeHandle(ref, () => ({
    getMarkdown: () => crepeRef.current?.getMarkdown() ?? "",
  }), []);

  return <Milkdown />;
});