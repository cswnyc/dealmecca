interface FeatureListProps {
  features: string[];
}

export function FeatureList({ features }: FeatureListProps): JSX.Element {
  return (
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3 text-sm text-[#64748B] dark:text-gray-200">
          <svg
            className="w-5 h-5 text-[#2575FC] dark:text-[#5B8DFF] flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
  );
}
