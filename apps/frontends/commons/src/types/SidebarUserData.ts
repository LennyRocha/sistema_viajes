export default interface SidebarUserData {
  name: string;
  role: string;
  links: {
    name: string;
    icon: string;
    href: string;
    privilege?: string;
    privileges?: string[];
    allowedRoles?: string[];
  }[];
  img: string;
}
