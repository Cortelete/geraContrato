import React from 'react';
import { FormData, Clause, ContractorData } from '../types';
import TermsAndConditions from './TermsAndConditions';

interface ContractDocumentProps {
    id: string;
    formData: FormData;
    contractorData: ContractorData;
    clauses: Clause[];
    terms: Clause[];
    contractTitle: string;
}

const Placeholder: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-slate-500 italic">{children}</span>
);

const ContractDocument: React.FC<ContractDocumentProps> = ({ id, formData, contractorData, clauses, terms, contractTitle }) => {
    const { 
        name, cpf, rg, address, isMinor, 
        parentName, parentCpf, parentRg, signatureConfirmation 
    } = formData;
    
    const contractorIdentifier = contractorData.cnpj 
        ? `inscrita no CNPJ sob o nº ${contractorData.cnpj}` 
        : contractorData.cpf 
        ? `inscrito(a) no CPF sob o nº ${contractorData.cpf}` 
        : <Placeholder>(CNPJ/CPF da Contratada)</Placeholder>;

    const fullAddress = [contractorData.streetAddress, contractorData.city, contractorData.cep && `CEP: ${contractorData.cep}`]
        .filter(Boolean)
        .join(', ');

    return (
        <div id={id} className="bg-white text-black px-12 pt-16 pb-24 font-serif" style={{ width: '21cm', minHeight: '29.7cm' }}>
            <div className="text-center mb-10">
                <h1 className="text-2xl font-bold uppercase">{contractTitle || <Placeholder>(Título do Contrato)</Placeholder>}</h1>
                <h2 className="text-xl font-semibold mt-2">{contractorData.businessName || <Placeholder>(Nome da Empresa/Contratada)</Placeholder>}</h2>
            </div>

            <div className="mb-8 text-sm leading-relaxed">
                <h3 className="text-base font-bold mb-3 uppercase underline underline-offset-4">Partes Contratantes</h3>
                <p className="mb-3 text-justify">
                    <strong>CONTRATADA:</strong> {contractorData.businessName || <Placeholder>(Nome Empresarial)</Placeholder>}
                    {contractorData.tradeName && <>, com nome fantasia <strong>"{contractorData.tradeName}"</strong></>}
                    , pessoa jurídica de direito privado (ou pessoa física), com {contractorIdentifier}, com sede em {fullAddress || <Placeholder>(Endereço da Contratada)</Placeholder>}
                    {contractorData.email && <>, e endereço de e-mail {contractorData.email}</>}, doravante denominada simplesmente <strong>CONTRATADA</strong>.
                </p>
                <p className="text-justify">
                    <strong>CONTRATANTE:</strong> {name || <Placeholder>(Nome do Cliente)</Placeholder>}, portador(a) do CPF nº {cpf || <Placeholder>(CPF do Cliente)</Placeholder>} e do RG nº {rg || <Placeholder>(RG do Cliente)</Placeholder>}, residente e domiciliado(a) no endereço: {address || <Placeholder>(Endereço do Cliente)</Placeholder>}.
                </p>
                {isMinor && (
                     <p className="mt-3 bg-gray-100 p-3 border border-gray-200 text-justify">
                        <strong>REPRESENTADO(A) POR SEU RESPONSÁVEL LEGAL:</strong> {parentName || <Placeholder>(Nome do Responsável)</Placeholder>}, portador(a) do CPF nº {parentCpf || <Placeholder>(CPF do Responsável)</Placeholder>} e do RG nº {parentRg || <Placeholder>(RG do Responsável)</Placeholder>}, que assina o presente instrumento.
                     </p>
                )}
            </div>

            {clauses.map((clause) => (
                <div key={clause.id} className="mb-8 text-sm leading-relaxed">
                    <h3 className="text-base font-bold mb-3 uppercase underline underline-offset-4">{clause.title}</h3>
                    <p className="text-justify whitespace-pre-wrap">{clause.content}</p>
                </div>
            ))}
            
            <div className="break-before-page pt-8">
                <div className="mb-8 text-sm leading-relaxed">
                    <h3 className="text-base font-bold mb-3 uppercase underline underline-offset-4">Termos e Condições Gerais</h3>
                    <p className="text-justify">A CONTRATANTE declara ter lido, compreendido e concordado com todos os Termos e Condições apresentados, os quais passam a fazer parte integrante deste contrato para todos os fins de direito.</p>
                </div>
                
                <div className="text-sm leading-relaxed">
                    <TermsAndConditions terms={terms} />
                </div>

                <div className="mt-16 text-center text-sm">
                    <p className="mb-8">E, por estarem assim justas e contratadas, as partes assinam o presente instrumento.</p>
                    
                    <div className="mt-20 inline-block">
                        <div className="border-t border-black pt-2 px-12">
                        <p className="font-serif text-base">{isMinor ? parentName || <Placeholder>(Nome do Responsável)</Placeholder> : name || <Placeholder>(Nome do Cliente)</Placeholder>}</p>
                        <p className="text-xs mt-1">({isMinor ? "Assinatura do Responsável Legal" : "Assinatura do(a) Cliente"})</p>
                        <p className="text-xs">CPF: {isMinor ? parentCpf || <Placeholder>(CPF do Responsável)</Placeholder> : cpf || <Placeholder>(CPF do Cliente)</Placeholder>}</p>
                        </div>
                    </div>

                     <div className="mt-20 inline-block ml-16">
                        <div className="border-t border-black pt-2 px-12">
                        <p className="font-serif text-base">{contractorData.businessName || <Placeholder>(Nome da Empresa/Contratada)</Placeholder>}</p>
                        <p className="text-xs mt-1">(Assinatura da Contratada)</p>
                        <p className="text-xs">CNPJ/CPF: {contractorData.cnpj || contractorData.cpf || <Placeholder>(CNPJ/CPF da Contratada)</Placeholder>}</p>
                        </div>
                    </div>
                    
                    {signatureConfirmation && (
                        <div className="mt-12 text-xs text-gray-500">
                            <p>Assinatura digital da CONTRATANTE confirmada pela digitação da frase:</p>
                            <p className="italic">"{signatureConfirmation}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractDocument;