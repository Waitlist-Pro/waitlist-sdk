import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface WaitlistFormSettingsProps {
  collectName: boolean;
  onCollectNameChange: (value: boolean) => void;
  socialSharing: boolean;
  onSocialSharingChange: (value: boolean) => void;
  confirmationEmail: boolean;
  onConfirmationEmailChange: (value: boolean) => void;
}

const WaitlistFormSettings = ({
  collectName,
  onCollectNameChange,
  socialSharing,
  onSocialSharingChange,
  confirmationEmail,
  onConfirmationEmailChange,
}: WaitlistFormSettingsProps) => {
  return (
    <div className="mt-4 space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Form Settings</h4>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="collect-name" className="text-sm text-gray-700">Collect Name</Label>
          <Switch
            id="collect-name"
            checked={collectName}
            onCheckedChange={onCollectNameChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="social-sharing" className="text-sm text-gray-700">Social Sharing</Label>
          <Switch
            id="social-sharing"
            checked={socialSharing}
            onCheckedChange={onSocialSharingChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="confirmation-email" className="text-sm text-gray-700">Confirmation Email</Label>
          <Switch
            id="confirmation-email"
            checked={confirmationEmail}
            onCheckedChange={onConfirmationEmailChange}
          />
        </div>
      </div>
    </div>
  );
};

export default WaitlistFormSettings;
