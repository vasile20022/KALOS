
import { toast } from "sonner";
import { Patient } from "@/types";

export interface Coach {
  id: string;
  name: string;
  surname: string;
  role: string;
}

export interface CoachClientRelationship {
  relationship_id: string;
  coach_id: string;
  coach_name: string;
  coach_surname: string;
  client_id: string;
  client_name: string;
  client_surname: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const fetchAvailableCoaches = async (): Promise<Coach[]> => {
  // Mock data for coaches
  const mockCoaches: Coach[] = [
    {
      id: 'coach-1',
      name: 'John',
      surname: 'Doe',
      role: 'coach'
    },
    {
      id: 'coach-2',
      name: 'Jane',
      surname: 'Smith',
      role: 'coach'
    }
  ];
  
  return mockCoaches;
};

export const requestCoach = async (coachId: string) => {
  try {
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      toast.error('You must be logged in to request a coach');
      return false;
    }
    
    const user = JSON.parse(userJson);
    console.log('Requesting coach with ID:', coachId, 'for user:', user.id);
    
    // Get existing coach relationships or create new array
    const relationships = JSON.parse(localStorage.getItem('coach_relationships') || '[]');
    
    // Check if relationship already exists
    if (relationships.some((r: CoachClientRelationship) => r.coach_id === coachId && r.client_id === user.id)) {
      toast.error('You have already requested this coach');
      return false;
    }
    
    // Create new relationship
    const newRelationship: CoachClientRelationship = {
      relationship_id: `rel-${Date.now()}`,
      coach_id: coachId,
      coach_name: 'Coach', // Would be fetched in real app
      coach_surname: 'Name', // Would be fetched in real app
      client_id: user.id,
      client_name: user.name || 'Client',
      client_surname: user.surname || '',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Save updated relationships
    relationships.push(newRelationship);
    localStorage.setItem('coach_relationships', JSON.stringify(relationships));
    
    toast.success('Coach request sent successfully');
    return true;
  } catch (error) {
    console.error('Error requesting coach:', error);
    toast.error('Failed to request coach');
    return false;
  }
};

export const getClientRequests = async (): Promise<CoachClientRelationship[]> => {
  try {
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) return [];
    
    const user = JSON.parse(userJson);
    console.log('Fetching relationships for user:', user.id, 'with role:', user?.role);
    
    // Get relationships from localStorage
    const relationships = JSON.parse(localStorage.getItem('coach_relationships') || '[]');
    
    // Filter relationships based on user role
    const userRelationships = relationships.filter((r: CoachClientRelationship) => {
      return user.role === 'coach' ? r.coach_id === user.id : r.client_id === user.id;
    });
    
    console.log('Retrieved relationships:', userRelationships);
    
    return userRelationships;
  } catch (error) {
    console.error('Error fetching relationships:', error);
    toast.error('Failed to load relationships');
    return [];
  }
};

export const updateRelationshipStatus = async (relationshipId: string, status: 'accepted' | 'rejected') => {
  try {
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      toast.error('You must be logged in to update relationship status');
      return false;
    }
    
    const user = JSON.parse(userJson);
    console.log('Updating relationship ID:', relationshipId, 'to status:', status);
    
    // Get relationships from localStorage
    const relationships = JSON.parse(localStorage.getItem('coach_relationships') || '[]');
    
    // Find the specific relationship
    const relationshipIndex = relationships.findIndex(
      (r: CoachClientRelationship) => r.relationship_id === relationshipId
    );
    
    if (relationshipIndex === -1) {
      toast.error('Relationship not found');
      return false;
    }
    
    // Update the relationship
    relationships[relationshipIndex].status = status;
    relationships[relationshipIndex].updated_at = new Date().toISOString();
    localStorage.setItem('coach_relationships', JSON.stringify(relationships));
    
    // If accepted, create a client profile
    if (status === 'accepted') {
      const relationship = relationships[relationshipIndex];
      
      // Create or update client profile
      const newPatient: Patient = {
        id: relationship.client_id,
        name: relationship.client_name,
        surname: relationship.client_surname,
        fitnessLevel: 'beginner',
        age: 30,
        weight: 70,
        height: 170,
        limitations: [],
        notes: '',
        createdAt: new Date(),
        createdBy: user.id,
        coachId: user.id
      };
      
      // Save patient to localStorage
      localStorage.setItem(`patient_${relationship.client_id}`, JSON.stringify(newPatient));
      
      toast.success('Client accepted and added to your patients');
      window.location.href = '/patients';
    } else {
      toast.success(`Request ${status} successfully`);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating relationship:', error);
    toast.error('Failed to update relationship status');
    return false;
  }
};

export const deleteClientRelationship = async (clientId: string): Promise<boolean> => {
  try {
    console.log('Deleting client:', clientId);
    
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      toast.error('You must be logged in to delete a client');
      return false;
    }
    
    // Remove from localStorage
    localStorage.removeItem(`patient_${clientId}`);
    
    // Update relationships
    const relationships = JSON.parse(localStorage.getItem('coach_relationships') || '[]');
    const updatedRelationships = relationships.filter(
      (r: CoachClientRelationship) => r.client_id !== clientId
    );
    
    localStorage.setItem('coach_relationships', JSON.stringify(updatedRelationships));
    
    toast.success('Client removed successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error during client deletion:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};

export const getClientProfiles = async (): Promise<Patient[]> => {
  try {
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) return [];
    
    const user = JSON.parse(userJson);
    if (user?.role !== 'coach') return [];
    
    // Get relationship data to find clients
    const relationships = JSON.parse(localStorage.getItem('coach_relationships') || '[]');
    const acceptedClients = relationships.filter(
      (r: CoachClientRelationship) => r.coach_id === user.id && r.status === 'accepted'
    );
    
    // Get client profiles
    const patients: Patient[] = [];
    for (const client of acceptedClients) {
      const patientJson = localStorage.getItem(`patient_${client.client_id}`);
      if (patientJson) {
        const patient = JSON.parse(patientJson);
        patients.push({
          ...patient,
          createdAt: new Date(patient.createdAt)
        });
      }
    }
    
    return patients;
  } catch (error) {
    console.error('Error fetching client profiles:', error);
    toast.error('Failed to load patient profiles');
    return [];
  }
};

export const getClientProfile = async (clientId: string): Promise<Patient | null> => {
  try {
    const patientJson = localStorage.getItem(`patient_${clientId}`);
    
    if (!patientJson) {
      console.log('No profile found for client:', clientId);
      return null;
    }
    
    const patient = JSON.parse(patientJson);
    return {
      ...patient,
      createdAt: new Date(patient.createdAt)
    };
  } catch (error) {
    console.error('Error fetching client profile:', error);
    toast.error('Failed to load patient profile');
    return null;
  }
};

export const updateClientProfile = async (clientId: string, profileData: Partial<Patient>): Promise<boolean> => {
  try {
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      toast.error('You must be logged in to update client profile');
      return false;
    }
    
    // Get existing profile
    const patientJson = localStorage.getItem(`patient_${clientId}`);
    if (!patientJson) {
      toast.error('Client profile not found');
      return false;
    }
    
    const patient = JSON.parse(patientJson);
    
    // Update profile
    const updatedPatient = {
      ...patient,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated profile
    localStorage.setItem(`patient_${clientId}`, JSON.stringify(updatedPatient));
    
    toast.success('Patient profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating client profile:', error);
    toast.error('Failed to update patient profile');
    return false;
  }
};
