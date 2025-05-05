
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClientProfile } from "@/integrations/supabase/client";
import { Patient } from "@/types";

interface NewPatientDialogProps {
  onPatientAdded?: () => void;
}

export function NewPatientDialog({ onPatientAdded }: NewPatientDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    age: "",
    weight: "",
    height: "",
    fitnessLevel: "",
    limitations: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, fitnessLevel: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.surname || !formData.age || !formData.weight || !formData.height || !formData.fitnessLevel) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert form data to patient object
      const patientData: Omit<Patient, 'id' | 'createdAt'> = {
        name: formData.name,
        surname: formData.surname,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        fitnessLevel: formData.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
        limitations: formData.limitations ? formData.limitations.split(',').map(item => item.trim()) : [],
        notes: formData.notes,
        createdBy: '',
      };
      
      // Save to Supabase
      const result = await createClientProfile(patientData);
      
      if (result.success) {
        toast.success("Client added successfully");
        // Reset form
        setFormData({
          name: "",
          surname: "",
          age: "",
          weight: "",
          height: "",
          fitnessLevel: "",
          limitations: "",
          notes: "",
        });
        // Close dialog
        setIsOpen(false);
        // Refresh patients list
        if (onPatientAdded) {
          onPatientAdded();
        }
      } else {
        toast.error(`Failed to add client: ${result.error}`);
      }
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error("An error occurred while adding the client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter the details of your new client. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">First Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Marco"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Last Name</Label>
              <Input
                id="surname"
                name="surname"
                placeholder="Rossi"
                value={formData.surname}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="35"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                placeholder="75"
                value={formData.weight}
                onChange={handleChange}
                min="1"
                step="0.1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                placeholder="180"
                value={formData.height}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fitnessLevel">Fitness Level</Label>
            <Select value={formData.fitnessLevel} onValueChange={handleSelectChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select fitness level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="limitations">Limitations</Label>
            <Input
              id="limitations"
              name="limitations"
              placeholder="Back pain, knee injury, etc. (comma separated)"
              value={formData.limitations}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional information about the client"
              className="h-20"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
