// Stub exports for deployment compatibility
import React from 'react';

export const Card = ({ children, className = "", ...props }: any) =>
  React.createElement('div', { className: `bg-white rounded-lg border shadow-sm ${className}`, ...props }, children);

export const CardHeader = ({ children, className = "", ...props }: any) =>
  React.createElement('div', { className: `flex flex-col space-y-1.5 p-6 ${className}`, ...props }, children);

export const CardTitle = ({ children, className = "", ...props }: any) =>
  React.createElement('h3', { className: `text-2xl font-semibold leading-none tracking-tight ${className}`, ...props }, children);

export const CardDescription = ({ children, className = "", ...props }: any) =>
  React.createElement('p', { className: `text-sm text-muted-foreground ${className}`, ...props }, children);

export const CardContent = ({ children, className = "", ...props }: any) =>
  React.createElement('div', { className: `p-6 pt-0 ${className}`, ...props }, children);

export const CardFooter = ({ children, className = "", ...props }: any) =>
  React.createElement('div', { className: `flex items-center p-6 pt-0 ${className}`, ...props }, children);

export const Button = ({ children, className = "", variant = "default", size = "default", ...props }: any) => {
  const variantClasses = {
    default: "bg-foreground text-white hover:bg-foreground/90",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-input bg-transparent hover:bg-muted",
    secondary: "bg-muted text-foreground hover:bg-muted",
    ghost: "hover:bg-muted",
    link: "text-blue-600 underline-offset-4 hover:underline",
    orange: "bg-orange-600 text-white hover:bg-orange-700"
  };

  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
    icon: "h-10 w-10"
  };

  return React.createElement('button', {
    className: `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant as keyof typeof variantClasses]} ${sizeClasses[size as keyof typeof sizeClasses]} ${className}`,
    ...props
  }, children);
};

export const Badge = ({ children, className = "", variant = "default", ...props }: any) => {
  const variantClasses = {
    default: "border-transparent bg-foreground text-white hover:bg-foreground/90",
    secondary: "border-transparent bg-muted text-foreground hover:bg-muted",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "text-foreground"
  };

  return React.createElement('div', {
    className: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${variantClasses[variant as keyof typeof variantClasses]} ${className}`,
    ...props
  }, children);
};

export const Tabs = ({ children, className = "", ...props }: any) =>
  React.createElement('div', { className, ...props }, children);

export const TabsList = ({ children, className = "", ...props }: any) =>
  React.createElement('div', {
    className: `inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`,
    ...props
  }, children);

export const TabsTrigger = ({ children, className = "", value, ...props }: any) =>
  React.createElement('button', {
    className: `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className}`,
    'data-value': value,
    ...props
  }, children);

export const TabsContent = ({ children, className = "", value, ...props }: any) =>
  React.createElement('div', {
    className: `mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`,
    'data-value': value,
    ...props
  }, children);