import { Badge } from '@/components/ui/badge';
import {
  getAgencyRoles,
  getAgencyMediaTypes,
  getAgencyGoals,
  getAdvertiserCapabilities,
  isAgency,
  isAdvertiser,
} from '@/lib/company-capabilities';

interface Contact {
  id: string;
  department?: string;
  primaryRole?: string;
  title?: string;
}

interface Company {
  id: string;
  name: string;
  companyType: string;
  agencyType?: string;
  industry?: string;
  advertisingModel?: string;
}

interface CapabilitiesSectionProps {
  company: Company;
  contacts: Contact[];
}

export function CapabilitiesSection({ company, contacts }: CapabilitiesSectionProps) {
  // Render agency capabilities
  if (isAgency(company.companyType)) {
    const roles = getAgencyRoles(contacts);
    const mediaTypes = getAgencyMediaTypes(company.agencyType, contacts);
    const goals = getAgencyGoals(company.agencyType);

    return (
      <div className="space-y-6">
        {/* Roles & Services */}
        {roles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Roles & Services</h3>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <Badge
                  key={role}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Media Expertise */}
        {mediaTypes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Media Types</h3>
            <div className="flex flex-wrap gap-2">
              {mediaTypes.map((media) => (
                <Badge
                  key={media}
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                >
                  {media}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Goals & Focus Areas */}
        {goals.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {goals.map((goal) => (
                <Badge
                  key={goal}
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {roles.length === 0 && mediaTypes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No capability information available yet. Check back as we add more team members.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Render advertiser capabilities
  if (isAdvertiser(company.companyType)) {
    const capabilities = getAdvertiserCapabilities(company, contacts);

    return (
      <div className="space-y-6">
        {/* Industry */}
        {capabilities.industry && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Industry</h3>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {capabilities.industry}
            </Badge>
          </div>
        )}

        {/* Advertising Model */}
        {capabilities.advertisingModel && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Advertising Approach</h3>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              {capabilities.advertisingModel}
            </Badge>
          </div>
        )}

        {/* Team Structure */}
        {capabilities.teamStructure.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Team Structure</h3>
            <div className="flex flex-wrap gap-2">
              {capabilities.teamStructure.map((dept) => (
                <Badge
                  key={dept}
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                >
                  {dept}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!capabilities.industry && !capabilities.advertisingModel && capabilities.teamStructure.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No company information available yet.
            </p>
          </div>
        )}
      </div>
    );
  }

  // For other company types (vendors, publishers, etc.)
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 text-sm">
        Company capabilities coming soon for this company type.
      </p>
    </div>
  );
}
