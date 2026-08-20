export default interface SidebarUserData {
  name: string;
  role: string;
  links: {
    name: string;
    icon: string;
    href: string;
    privilege?: string;
  }[];
  img: string;
}
