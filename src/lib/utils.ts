// ============================================
// JuridIQ - Utility Functions
// ============================================

import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

// ---- Class Name Merger ----
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ---- Date Formatting ----
export function formatFecha(date: string | Date, fmt: string = 'dd/MM/yyyy') {
  return format(new Date(date), fmt, { locale: es });
}

export function formatFechaHora(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy 'a las' HH:mm", { locale: es });
}

export function formatHora(date: string | Date) {
  return format(new Date(date), 'HH:mm', { locale: es });
}

export function formatFechaRelativa(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function formatFechaLarga(date: string | Date) {
  return format(new Date(date), "EEEE dd 'de' MMMM 'de' yyyy", { locale: es });
}

export function esFechaHoy(date: string | Date) {
  return isToday(new Date(date));
}

export function esFechaManana(date: string | Date) {
  return isTomorrow(new Date(date));
}

export function esFechaPasada(date: string | Date) {
  return isPast(new Date(date));
}

export function diasRestantes(date: string | Date) {
  return differenceInDays(new Date(date), new Date());
}

// ---- Currency Formatting ----
export function formatMonto(amount: number | undefined | null) {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

// ---- Text Helpers ----
export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(n => n.length > 2)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

export function truncate(str: string, length: number = 50) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---- Greeting ----
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
