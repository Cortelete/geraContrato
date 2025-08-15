
import React from 'react';
import { Clause } from '../types';

interface TermsAndConditionsProps {
    terms: Clause[];
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ terms }) => {
    return (
        <div className="space-y-4">
            {terms.map((section) => (
                <div key={section.id}>
                    <h4 className="font-bold text-base mt-3 mb-1">{section.title}</h4>
                    <p className="text-sm text-justify">{section.content}</p>
                </div>
            ))}
        </div>
    );
};

export default TermsAndConditions;
