import { Influencer } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Dot } from "lucide-react";

type Props = {
  influencer: Influencer;
};

const InfluencerInfo = ({ influencer }: Props) => {
  return (
    <Card className="border-sla">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight">
          {influencer.name}
        </CardTitle>
        <CardDescription>
          {influencer.city}, {influencer.country}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex">
        {influencer.cuisines.map((item, index) => (
          <span className="flex">
            <span>{item}</span>
            {index < influencer.cuisines.length - 1 && <Dot />}
          </span>
        ))}
      </CardContent>
    </Card>
  );
};

export default InfluencerInfo;
