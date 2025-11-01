import {
  type LucideProps,
  Home,
  Car,
  Coffee,
  ShoppingBag,
  Ticket,
  Lightbulb,
  Landmark,
  Plane,
  Palette,
  Bus,
  Laptop,
  PartyPopper,
  Dumbbell,
  Gift,
  Heart,
  Music,
  PawPrint,
  Smartphone,
  Receipt,
  Wallet,
  Shirt,
  GraduationCap,
  Briefcase,
  type LucideIcon,
  Book,
  Film,
  Utensils,
  Pizza,
  Repeat,
  LayoutDashboard
} from "lucide-react";

export const ICONS = [
  "Home",
  "Car",
  "Coffee",
  "ShoppingBag",
  "Ticket",
  "Lightbulb",
  "Landmark",
  "Plane",
  "Palette",
  "Bus",
  "Laptop",
  "PartyPopper",
  "Dumbbell",
  "Gift",
  "Heart",
  "Music",
  "PawPrint",
  "Smartphone",
  "Receipt",
  "Wallet",
  "Shirt",
  "GraduationCap",
  "Briefcase",
  "Book",
  "Film",
  "Utensils",
  "Pizza",
  "Repeat",
  "LayoutDashboard",
] as const;

export type IconName = (typeof ICONS)[number];

type IconsType = {
  [key in IconName]: LucideIcon;
};

const icons: IconsType = {
  Home,
  Car,
  Coffee,
  ShoppingBag,
  Ticket,
  Lightbulb,
  Landmark,
  Plane,
  Palette,
  Bus,
  Laptop,
  PartyPopper,
  Dumbbell,
  Gift,
  Heart,
  Music,
  PawPrint,
  Smartphone,
  Receipt,
  Wallet,
  Shirt,
  GraduationCap,
  Briefcase,
  Book,
  Film,
  Utensils,
  Pizza,
  Repeat,
  LayoutDashboard
};

interface IconProps extends LucideProps {
  name: string;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = icons[name as IconName];

  if (!LucideIcon) {
    return <Landmark {...props} />; // Return a default icon
  }

  return <LucideIcon {...props} />;
};
