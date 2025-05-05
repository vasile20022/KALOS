
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Mail, Save, Ruler, Weight, Calendar, Activity, AlertTriangle, FileText } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateClientProfile } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Profile form validation schema for all users
const baseProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

// Additional fields only for clients
const clientProfileSchema = baseProfileSchema.extend({
  height: z.coerce.number().min(1, "Height must be greater than 0").optional(),
  weight: z.coerce.number().min(1, "Weight must be greater than 0").optional(),
  age: z.coerce.number().min(1, "Age must be greater than 0").optional(),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  limitations: z.string().optional(),
  notes: z.string().optional(),
});

// Type for the form values
type ProfileFormValues = z.infer<typeof clientProfileSchema>;

interface ProfileFormProps {
  user: any; // User from auth context
  clientProfile: any; // Client profile data
  onProfileUpdate: () => void; // Callback to refresh profile data
  updateProfile: (data: {name: string, surname: string, email: string}) => Promise<{success: boolean, error?: string}>;
}

export default function ProfileForm({ user, clientProfile, onProfileUpdate, updateProfile }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isClient = user?.role === 'client';

  // Profile form with the appropriate schema based on user role
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(isClient ? clientProfileSchema : baseProfileSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      // Client-specific fields are only needed for clients
      ...(isClient && {
        height: undefined,
        weight: undefined,
        age: undefined,
        fitnessLevel: undefined,
        limitations: "",
        notes: "",
      })
    },
  });

  // Set form values when user or clientProfile changes
  useEffect(() => {
    if (user) {
      // Update basic user data
      const formData: Partial<ProfileFormValues> = {
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
      };

      // Add client profile data if available and user is a client
      if (isClient && clientProfile) {
        // Convert any array limitations to a comma-separated string
        const limitationsString = Array.isArray(clientProfile.limitations) 
          ? clientProfile.limitations.join(', ') 
          : clientProfile.limitations || '';
          
        // Ensure fitness_level is one of the valid enum values
        const fitnessLevel = clientProfile.fitness_level === 'beginner' || 
                            clientProfile.fitness_level === 'intermediate' || 
                            clientProfile.fitness_level === 'advanced' 
                            ? clientProfile.fitness_level as "beginner" | "intermediate" | "advanced"
                            : undefined;
        
        formData.height = clientProfile.height || undefined;
        formData.weight = clientProfile.weight || undefined;
        formData.age = clientProfile.age || undefined;
        formData.fitnessLevel = fitnessLevel;
        formData.limitations = limitationsString;
        formData.notes = clientProfile.notes || "";
      }

      profileForm.reset(formData);
    }
  }, [user, clientProfile, profileForm, isClient]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Update user profile (name, surname, email)
      const userUpdateResult = await updateProfile({
        name: data.name,
        surname: data.surname,
        email: data.email
      });
      
      // Update client profile data only if the user is a client
      if (isClient && user?.id) {
        // Convert limitations string to array if not empty
        const limitationsArray = data.limitations ? 
          data.limitations.split(',').map(item => item.trim()) : 
          [];
          
        const clientProfileData = {
          height: data.height,
          weight: data.weight,
          age: data.age,
          fitness_level: data.fitnessLevel,
          limitations: limitationsArray,
          notes: data.notes
        };
        
        const clientProfileResult = await updateClientProfile(user.id, clientProfileData);
        
        if (userUpdateResult.success && clientProfileResult.success) {
          toast.success("Profile updated successfully");
          onProfileUpdate(); // Refresh profile data
        } else {
          toast.error(userUpdateResult.error || clientProfileResult.error || "Failed to update profile");
        }
      } else {
        // For non-client users, only update basic profile
        if (userUpdateResult.success) {
          toast.success("Profile updated successfully");
          onProfileUpdate(); // Refresh profile data
        } else {
          toast.error(userUpdateResult.error || "Failed to update profile");
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...profileForm}>
      <form id="profile-form" onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={profileForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={profileForm.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={profileForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormDescription>
                This email will be used for account notifications and communications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Client-specific fields, only shown for clients */}
        {isClient && (
          <>
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={profileForm.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Height (cm)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Weight className="h-4 w-4" />
                      Weight (kg)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Age
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={profileForm.control}
              name="fitnessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Fitness Level
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your fitness level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={profileForm.control}
              name="limitations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Physical Limitations
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E.g., Lower back pain, knee injury (separate with commas)" />
                  </FormControl>
                  <FormDescription>
                    List any physical limitations or medical conditions relevant for your exercises
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={profileForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Additional Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Add any additional information that might be helpful for your coach"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
