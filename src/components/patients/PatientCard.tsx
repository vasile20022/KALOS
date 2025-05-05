
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Patient } from "@/types";
import { ClipboardList, User } from "lucide-react";
import { format } from "date-fns";

interface PatientCardProps {
  patient: Patient;
}

export default function PatientCard({ patient }: PatientCardProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-scale-in">
      <CardContent className="p-6">
        {/* Intestazione con info paziente e livello fitness */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {patient.name} {patient.surname}
              </h3>
              <p className="text-sm text-muted-foreground">
                {patient.age} years, {patient.height}cm, {patient.weight}kg
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              patient.fitnessLevel === "beginner"
                ? "bg-blue-100 text-blue-800"
                : patient.fitnessLevel === "intermediate"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {patient.fitnessLevel}
          </span>
        </div>
        
        {/* Limitazioni del paziente */}
        {patient.limitations && patient.limitations.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium">Limitations:</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {patient.limitations.map((limitation) => (
                <span
                  key={limitation}
                  className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs"
                >
                  {limitation}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Note sul paziente */}
        {patient.notes && (
          <div className="mt-4">
            <p className="text-sm font-medium">Notes:</p>
            <p className="mt-1 text-sm text-muted-foreground">{patient.notes}</p>
          </div>
        )}
        
        {/* Data di creazione */}
        <div className="mt-4 text-xs text-muted-foreground">
          Created: {format(new Date(patient.createdAt), "MMM d, yyyy")}
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <div className="flex w-full flex-col sm:flex-row sm:justify-end gap-2">
          <Link to={`/patients/${patient.id}`}>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <User className="mr-1 h-4 w-4" />
              Profile
            </Button>
          </Link>
          <Link to={`/patients/${patient.id}?tab=plan`}>
            <Button size="sm" className="w-full sm:w-auto">
              <ClipboardList className="mr-1 h-4 w-4" />
              View Plan
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
