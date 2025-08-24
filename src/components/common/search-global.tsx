import { useState } from "react";
import CloseIcon from "../icons/close-icon";
import SearchIcon from "../icons/share-icon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { Input } from "../ui/input";

function SearchGlobal() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer direction="top" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex cursor-pointer !bg-transparent"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="size-[25px] lg:size-[35px]" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-screen !max-h-screen bg-[#73070F]/80">
        <Button
          className="absolute top-[50px] right-[100px] [&_path]:!stroke-white hover:bg-black"
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
        >
          <CloseIcon className="size-[42px]" />
        </Button>
        <label className="relative mt-[20vh] max-w-[825px] mx-auto w-full">
          <img
            className="absolute top-0 bottom-0 left-8 my-auto"
            src={`${process.env.EXPO_BASE_URL}search-black.svg`}
            alt=""
          />
          <Input
            className="placeholder:text-lg font-light bg-white w-full h-[85px] rounded-full ps-18"
            type="search"
            placeholder="Search here"
          />
        </label>
      </DrawerContent>
    </Drawer>
  );
}

export default SearchGlobal;
