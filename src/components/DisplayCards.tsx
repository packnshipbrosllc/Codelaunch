'use client';

import { cn } from "@/lib/utils";

interface DisplayCardProps {
  className?: string;
  icon?: string;
  title?: string;
  description?: string;
  meta?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = "✨",
  title = "Feature",
  description = "Description here",
  meta = "Details",
  iconClassName = "",
  titleClassName = "text-purple-400",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-gray-900/70 backdrop-blur-sm px-4 py-3 transition-all duration-700",
        "after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-[#0a0a0f] after:to-transparent after:content-['']",
        "hover:border-purple-500/50 hover:bg-purple-900/20",
        "[&>*]:relative [&>*]:z-10 [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      <div>
        <span className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-base",
          iconClassName
        )}>
          {icon}
        </span>
        <p className={cn("text-lg font-semibold", titleClassName)}>{title}</p>
      </div>
      <p className="text-base text-gray-200 line-clamp-2">{description}</p>
      <p className="text-sm text-gray-500">{meta}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards: (DisplayCardProps & { className: string })[] = [
    {
      icon: "🧠",
      title: "AI Mindmap",
      description: "Transform ideas into detailed mindmaps with features, competitors & personas",
      meta: "Step 1 • 5 minutes",
      titleClassName: "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
      className: cn(
        "[grid-area:stack] z-30",
        "before:absolute before:inset-0 before:bg-gray-950/50 before:rounded-xl before:transition-opacity before:duration-700",
        "grayscale-[100%] hover:grayscale-0 hover:before:opacity-0",
        "hover:-translate-y-10"
      ),
    },
    {
      icon: "📋",
      title: "PRD Generation",
      description: "10,000+ line PRDs with database schemas, API specs & user stories",
      meta: "Step 2 • 15 minutes",
      titleClassName: "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
      className: cn(
        "[grid-area:stack] translate-x-16 translate-y-10 z-20",
        "before:absolute before:inset-0 before:bg-gray-950/50 before:rounded-xl before:transition-opacity before:duration-700",
        "grayscale-[100%] hover:grayscale-0 hover:before:opacity-0",
        "hover:-translate-y-1"
      ),
    },
    {
      icon: "⚡",
      title: "Full-Stack Code",
      description: "Production-ready code you can deploy or feed into Claude/Cursor",
      meta: "Step 3 • 25 minutes",
      titleClassName: "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
      className: cn(
        "[grid-area:stack] translate-x-32 translate-y-20 z-10",
        "hover:translate-y-10"
      ),
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center min-h-[500px] opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}

