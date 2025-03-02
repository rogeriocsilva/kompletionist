import { API_URL } from "@/api/http";
import { IMedia } from "@/api/types";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";

interface Props {
  media: IMedia;
}

export function MediaCard({ media }: Props) {
  return (
    <Card className="max-h-96 grid grid-rows-[auto, minmax(0, 1fr)] grid-cols-1 gap-2 w-full h-full">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold">{media.type}</p>
        <small className="text-default text-primary truncate w-full">
          {media.categories.join(", ")}
        </small>
        <h4 className="font-bold text-large truncate w-full">{media.title}</h4>
      </CardHeader>
      <CardBody className="overflow-visible w-full h-72">
        <Image
          alt={`${media.title} poster`}
          className="object-cover rounded-xl"
          src={API_URL + media.details?.cached_poster}
          width="100%"
          height="100%"
          isBlurred
          removeWrapper
        />
      </CardBody>
      <CardFooter className="justify-between rounded-large absolute bottom-2 z-10 px-8">
        <Button
          radius="full"
          color="primary"
          variant="solid"
          className="text-tiny w-full "
        >
          Request it
        </Button>
      </CardFooter>
    </Card>
  );
}
