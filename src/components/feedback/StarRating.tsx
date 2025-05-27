"use client";

import * as React from "react"; // Added this line
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
  maxStars?: number;
  disabled?: boolean;
  size?: number; 
}

export function StarRating({
  rating,
  setRating,
  maxStars = 5,
  disabled = false,
  size = 24, 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleMouseEnter = (index: number) => {
    if (!disabled) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverRating(0);
    }
  };

  const handleClick = (index: number) => {
    if (!disabled) {
      setRating(index);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            type="button"
            key={starValue}
            disabled={disabled}
            className={cn(
              "p-1 rounded-md transition-colors",
              !disabled && "hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            aria-label={`Rate ${starValue} out of ${maxStars} stars`}
          >
            <Star
              className={cn(
                "transition-colors",
                (hoverRating >= starValue || rating >= starValue)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-muted-foreground/50",
                disabled ? "cursor-not-allowed" : "cursor-pointer"
              )}
              size={size}
            />
          </button>
        );
      })}
    </div>
  );
}

