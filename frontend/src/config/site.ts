export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "kompletionist",
  description:
    "Read kometa missing files, generate a list of missing media and request them to overseer",
  navItems: [
    {
      label: "Movies",
      href: "/movies",
    },
    {
      label: "Shows",
      href: "/shows",
    },
    {
      label: "Categories",
      href: "/categories",
    },
  ],
  links: {
    github: "https://github.com/rogeriocsilva",
    twitter: "https://twitter.com/_rogeriocsilva",
  },
};
