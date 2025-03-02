import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { TwitterIcon, GithubIcon, Logo, SearchIcon } from "@/components/icons";

export const Navbar = () => {
  const searchInput = (
    <Input
      isClearable
      aria-label="Search"
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-500 pointer-events-none flex-shrink-0" />
      }
      type="search"
      className="bg-default"
    />
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />
            <p className="font-bold text-inherit">{siteConfig.name}</p>
          </Link>
        </NavbarBrand>
        <div className="hidden md:flex gap-4 justify-start ml-2 md:basis-full">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent className="flex basis-1/5 md:basis-full" justify="end">
        <NavbarItem className="hidden md:flex">{searchInput}</NavbarItem>
        <NavbarItem className="sm:flex gap-2">
          <Link isExternal href={siteConfig.links.twitter} title="Twitter">
            <TwitterIcon className="text-foreground" />
          </Link>

          <Link isExternal href={siteConfig.links.github} title="GitHub">
            <GithubIcon className="text-foreground" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="md:hidden">
          <NavbarMenuToggle />
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        <NavbarItem className="flex">{searchInput}</NavbarItem>
        <div className="mx-4 mt-4 flex flex-col gap-2">
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
