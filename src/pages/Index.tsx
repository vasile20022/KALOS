
/**
 * Componente della pagina principale
 * 
 * Questo componente renderizza la landing page dell'applicazione KALOS.
 * Include sezioni per il titolo, le caratteristiche principali e un
 * invito all'azione per iniziare a utilizzare l'applicazione.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import { Activity, Calendar, ClipboardList, Users } from "lucide-react";

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative">
          <div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                KALOS
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                A comprehensive solution for physiotherapists and personal trainers
                to create, manage, and customize exercise plans for their patients.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/login">
                  <Button size="lg" className="animate-fade-in">
                    Get Started
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="animate-fade-in"
                >
                  <a href="#features">Learn More</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-secondary/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Features
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to manage your physiotherapy practice
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Patient Management"
                description="Create and manage detailed patient profiles with fitness levels, limitations, and progress tracking."
              />
              <FeatureCard
                icon={<ClipboardList className="h-8 w-8" />}
                title="Exercise Plans"
                description="Create personalized exercise plans with detailed instructions and parameters."
              />
              <FeatureCard
                icon={<Activity className="h-8 w-8" />}
                title="Exercise Library"
                description="Access a comprehensive library of exercises or create custom ones for your patients."
              />
              <FeatureCard
                icon={<Calendar className="h-8 w-8" />}
                title="Scheduling"
                description="Organize exercises by day and time slots for a structured rehabilitation program."
              />
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Get Started Today
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start planning effective rehabilitation programs for your patients
              </p>
              <div className="mt-8">
                <Link to="/login">
                  <Button size="lg" className="animate-fade-in">
                    Sign In Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-secondary/20 py-12">
          <div className="mx-auto max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} PhysioPlanner. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

/**
 * Componente per le card delle funzionalità
 * 
 * Questo componente visualizza un'icona, un titolo e una descrizione
 * per rappresentare una funzionalità dell'applicazione.
 */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-8 text-center",
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "bg-background border border-border/50"
      )}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="mt-6 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
