"use client";

import { cn } from "@/lib/utils";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon,
  title = "Featured",
  description = "Discover amazing content",
  date = "Feature",
  iconClassName = "text-purple-500",
  titleClassName = "text-purple-500",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        // Base card styling with glass morphism
        "relative flex h-48 w-[22rem] select-none flex-col justify-between rounded-2xl border-2 px-6 py-6 transition-all duration-500",
        // Glass effect
        "backdrop-blur-xl",
        // Shadow and glow
        "shadow-xl",
        // Hover effects
        "hover:scale-105 hover:shadow-2xl",
        // Gradient overlay for grayscale effect
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-gray-900/50 before:to-transparent before:opacity-100 hover:before:opacity-0 before:transition-opacity before:duration-700",
        // Grayscale to color transition
        "grayscale hover:grayscale-0",
        className
      )}
    >
      {/* Icon with background */}
      <div className="relative z-10 flex items-center gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300",
            iconClassName.includes("purple") && "bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30",
            iconClassName.includes("pink") && "bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30",
            iconClassName.includes("blue") && "bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
          )}
        >
          {icon}
        </div>
        <div>
          <h3 className={cn("text-xl font-bold text-white", titleClassName)}>{title}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="relative z-10 text-sm text-gray-300 leading-relaxed">
        {description}
      </p>

      {/* Date/Badge */}
      <p className="relative z-10 text-xs text-gray-500">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className: "[grid-area:stack] hover:-translate-y-10",
    },
    {
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
