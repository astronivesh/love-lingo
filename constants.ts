import { PartnerType } from './types';
import { Heart, ShieldAlert, Sparkles, MessageCircle, Skull } from 'lucide-react';

export const PARTNER_OPTIONS = [
  { value: PartnerType.GF, label: 'Girlfriend', icon: Heart },
  { value: PartnerType.BF, label: 'Boyfriend', icon: Heart },
  { value: PartnerType.PARTNER, label: 'Partner', icon: Sparkles },
  { value: PartnerType.CRUSH, label: 'Crush', icon: MessageCircle },
  { value: PartnerType.EX, label: 'Ex', icon: Skull },
];

export const QUICK_SCENARIOS = [
  { message: "I'm fine.", context: "After I forgot to text back for 4 hours." },
  { message: "Do whatever you want.", context: "Discussing weekend plans." },
  { message: "Who is she?", context: "Liked a photo on Instagram." },
  { message: "It's funny how...", context: "Arguments about chores." },
  { message: "k", context: "Sent a long heartfelt paragraph." },
];

export const DANGER_LEVEL_LABELS: Record<number, string> = {
  1: "Safe Zone",
  2: "All Good",
  3: "Mild Caution",
  4: "Be Careful",
  5: "Tread Lightly",
  6: "Yellow Alert",
  7: "Orange Alert",
  8: "Red Alert",
  9: "DEFCON 1",
  10: "Nuclear Winter",
};
