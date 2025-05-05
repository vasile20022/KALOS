
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchAvailableCoaches, getClientRequests, updateRelationshipStatus, requestCoach, Coach, CoachClientRelationship } from "./coachingUtils";
import { useAuth } from "@/lib/auth/AuthContext";

export default function CoachingRelationships() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [relationships, setRelationships] = useState<CoachClientRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load coaches
        const availableCoaches = await fetchAvailableCoaches();
        setCoaches(availableCoaches);
        
        // Load relationships
        const userRelationships = await getClientRequests();
        setRelationships(userRelationships);
      } catch (error) {
        console.error('Error loading coaching data:', error);
        toast({
          title: "Error",
          description: "Failed to load coaching data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  const handleRequestCoach = async (coachId: string) => {
    const success = await requestCoach(coachId);
    if (success) {
      // Refresh relationships
      const updatedRelationships = await getClientRequests();
      setRelationships(updatedRelationships);
    }
  };

  const handleUpdateStatus = async (relationshipId: string, status: 'accepted' | 'rejected') => {
    const success = await updateRelationshipStatus(relationshipId, status);
    if (success && status === 'rejected') {
      // Refresh relationships only if rejected (accepted redirects to patients)
      const updatedRelationships = await getClientRequests();
      setRelationships(updatedRelationships);
    }
  };

  const isCoach = user?.role === 'coach';

  return (
    <div className="space-y-6">
      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading coaching data...</p>
          </CardContent>
        </Card>
      ) : isCoach ? (
        // Coach view - requested clients
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Client Requests</h2>
          {relationships.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You have no client requests at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {relationships.map((relationship) => (
                <Card key={relationship.relationship_id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {relationship.client_name.charAt(0)}
                            {relationship.client_surname.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{relationship.client_name} {relationship.client_surname}</h3>
                          <p className="text-sm text-muted-foreground">
                            Requested on {new Date(relationship.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={relationship.status === 'pending' ? 'outline' : relationship.status === 'accepted' ? 'default' : 'destructive'}>
                        {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                      </Badge>
                    </div>
                    
                    {relationship.status === 'pending' && (
                      <div className="flex gap-2 mt-4 justify-end">
                        <Button 
                          variant="outline"
                          onClick={() => handleUpdateStatus(relationship.relationship_id, 'rejected')}
                        >
                          Decline
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(relationship.relationship_id, 'accepted')}
                        >
                          Accept
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Client view - available coaches and requests
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Available Coaches</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => {
              const hasRequested = relationships.some(
                (r) => r.coach_id === coach.id && r.client_id === user?.id
              );
              const requestStatus = hasRequested 
                ? relationships.find(r => r.coach_id === coach.id && r.client_id === user?.id)?.status 
                : null;
                
              return (
                <Card key={coach.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{coach.name} {coach.surname}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fitness Coach</span>
                      {requestStatus ? (
                        <Badge variant={requestStatus === 'pending' ? 'outline' : requestStatus === 'accepted' ? 'default' : 'destructive'}>
                          {requestStatus.charAt(0).toUpperCase() + requestStatus.slice(1)}
                        </Badge>
                      ) : (
                        <Button size="sm" onClick={() => handleRequestCoach(coach.id)}>
                          Request
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {relationships.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Your Coach Requests</h2>
              <div className="grid gap-4">
                {relationships.map((relationship) => (
                  <Card key={relationship.relationship_id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {relationship.coach_name.charAt(0)}
                              {relationship.coach_surname.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{relationship.coach_name} {relationship.coach_surname}</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested on {new Date(relationship.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={relationship.status === 'pending' ? 'outline' : relationship.status === 'accepted' ? 'default' : 'destructive'}>
                          {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
