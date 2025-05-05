
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { User, Dumbbell, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fetchExercisesData } from "@/components/exercises/exerciseUtils";
import { format } from "date-fns";

/**
 * Dashboard principale dell'applicazione
 * 
 * Questo componente gestisce:
 * - La visualizzazione dei dati principali in card riassuntive
 * - Il recupero di statistiche dal database (clienti, esercizi, sessioni)
 * - Collegamenti rapidi alle sezioni principali dell'applicazione
 */

export default function Dashboard() {
  const { user } = useAuth();
  const [clientCount, setClientCount] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [todaySessionCount, setTodaySessionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        
        // Get authenticated user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.log("No active session found");
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Fetch client count
        const { count: clientsCount, error: clientsError } = await supabase
          .from('client_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('coach_id', userId);
          
        if (clientsError) {
          console.error("Error fetching clients count:", clientsError);
        } else {
          setClientCount(clientsCount || 0);
        }
        
        // Fetch exercises count
        try {
          const exercises = await fetchExercisesData();
          setExerciseCount(exercises.length);
        } catch (error) {
          console.error("Error fetching exercises:", error);
          setExerciseCount(0);
        }
        
        // Fetch today's sessions count
        const today = format(new Date(), "yyyy-MM-dd");
        
        const { data: todaySessions, error: sessionsError } = await supabase
          .from('scheduled_exercises')
          .select('exercise_plans!inner(*)')
          .eq('scheduled_date', today)
          .eq('exercise_plans.coach_id', userId);
          
        if (sessionsError) {
          console.error("Error fetching today's sessions:", sessionsError);
        } else {
          // Count unique clients with sessions today
          const uniqueClients = new Set();
          todaySessions?.forEach(session => {
            if (session.exercise_plans && session.exercise_plans.client_id) {
              uniqueClients.add(session.exercise_plans.client_id);
            }
          });
          
          setTodaySessionCount(uniqueClients.size);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to default values in case of error
        setClientCount(0);
        setExerciseCount(0);
        setTodaySessionCount(0);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout allowedRoles={['coach', 'admin']}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
            Dashboard
          </h1>
          <p className="text-muted-foreground animate-fade-in delay-75">
            {user?.name ? `Welcome back, ${user.name}` : "Welcome back"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<User className="h-5 w-5" />}
          title="Total Clients"
          value={isLoading ? "..." : clientCount.toString()}
          description="Active client records"
          link="/patients"
          linkText="View all clients"
        />
        <StatCard
          icon={<Dumbbell className="h-5 w-5" />}
          title="Exercises"
          value={isLoading ? "..." : exerciseCount.toString()}
          description="Available exercises"
          link="/exercises"
          linkText="View exercise library"
        />
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          title="Today's Sessions"
          value={isLoading ? "..." : todaySessionCount.toString()}
          description="Clients with sessions today"
          link="/coach-schedule"
          linkText="View schedule"
        />
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  link: string;
  linkText: string;
}

function StatCard({ icon, title, value, description, link, linkText }: StatCardProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="rounded-full bg-secondary p-1.5">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Link
          to={link}
          className="text-xs text-primary hover:underline mt-2 inline-block"
        >
          {linkText}
        </Link>
      </CardContent>
    </Card>
  );
}
