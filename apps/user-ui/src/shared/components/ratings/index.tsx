import React, { FC } from "react";
import { Star } from "lucide-react";

type Props = {
  rating: number;
};

const Ratings: FC<Props> = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(
        <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
      );
    } else if (i - 0.5 <= rating) {
      stars.push(
        <Star
          key={i}
          size={16}
          className="text-yellow-400 fill-yellow-400 opacity-50"
        />
      );
    } else {
      stars.push(<Star key={i} size={16} className="text-gray-300" />);
    }
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default Ratings;
