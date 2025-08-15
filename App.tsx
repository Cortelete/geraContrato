import React, { useState, useCallback, ChangeEvent } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ContractorData, FormData, Clause } from './types';
import { parseClientData } from './services/parser';
import { generatePdf } from './services/pdfGenerator';
import ContractDocument from './components/ContractDocument';

const initialFormData: FormData = {
    name: '', email: '', phone: '', cpf: '', rg: '', birthDate: '',
    address: '', instagram: '', course: '', paymentMethod: '', howFound: '',
    termsAccepted: '', signatureConfirmation: '', isMinor: false,
    parentName: '', parentCpf: '', parentRg: '',
};

const initialContractorData: ContractorData = {
    companyName: '',
    companyId: '',
    companyAddress: ''
};

const FileIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
);

const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
);

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3z"/><path d="M5 3v4h4"/><path d="M19 17v4h-4"/></svg>
);


const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
);

const LoadingIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
);

const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);


const App: React.FC = () => {
    const [step, setStep] = useState<'initial' | 'editing'>('initial');
    const [contractorData, setContractorData] = useState<ContractorData>(initialContractorData);
    const [contractDescription, setContractDescription] = useState('');
    const [contractTitle, setContractTitle] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [rawText, setRawText] = useState('');
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isParsed, setIsParsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // For PDF generation
    const [clauses, setClauses] = useState<Clause[]>([]);
    const [terms, setTerms] = useState<Clause[]>([]);

    const handleRawTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setRawText(e.target.value);
    };

    const handleParseData = useCallback(() => {
        if (rawText.trim() === '') return;
        let parsedData = parseClientData(rawText);
        if (parsedData.name && parsedData.signatureConfirmation) {
            parsedData.signatureConfirmation = `Eu, ${parsedData.name}, aceito os termos e confirmo.`;
        }
        if (Object.keys(parsedData).length > 1) {
            setFormData({ ...initialFormData, ...parsedData });
            setIsParsed(true);
        } else {
            setIsParsed(false);
        }
    }, [rawText]);
    
    const handleUpdateContractorField = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContractorData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleUpdateField = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isCheckbox = 'checked' in e.target;
        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
        }));
    }, []);
    
    const handleGeneratePdf = useCallback(async () => {
        setIsLoading(true);
        const fileName = `Contrato_${formData.name.replace(/\s/g, '_') || 'cliente'}`;
        await generatePdf('contract-pdf-source', fileName, contractorData.companyName, contractorData.companyAddress);
        setIsLoading(false);
    }, [formData.name, contractorData]);

    const handleReset = useCallback(() => {
        setRawText('');
        setFormData(initialFormData);
        setContractorData(initialContractorData);
        setContractDescription('');
        setContractTitle('');
        setClauses([]);
        setTerms([]);
        setIsParsed(false);
        setStep('initial');
    }, []);

    const handleGenerateContractStructure = async () => {
        if (!contractDescription.trim()) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Com base na seguinte descrição, gere uma estrutura para um contrato de prestação de serviços em português do Brasil. Descrição: "${contractDescription}". A resposta DEVE ser um objeto JSON. As cláusulas devem ser claras e cobrir os pontos essenciais como objeto, pagamento, obrigações, prazo e rescisão.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "Um título conciso para o contrato. Ex: 'Contrato de Prestação de Serviços de Social Media'" },
                            clauses: {
                                type: Type.ARRAY,
                                description: "As cláusulas principais do contrato.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING, description: "O título da cláusula. Ex: 'Cláusula Primeira - Do Objeto'" },
                                        content: { type: Type.STRING, description: "O texto completo da cláusula." }
                                    },
                                }
                            },
                            terms: {
                                type: Type.ARRAY,
                                description: "Os termos e condições gerais, como política de privacidade, cancelamento, etc.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING, description: "O título do termo. Ex: '1. Política de Cancelamento'" },
                                        content: { type: Type.STRING, description: "O texto completo do termo." }
                                    },
                                }
                            }
                        },
                    },
                },
            });

            const resultText = response.text.trim();
            const resultJson = JSON.parse(resultText);

            setContractTitle(resultJson.title || 'Contrato de Prestação de Serviços');
            setClauses(resultJson.clauses.map((c: Omit<Clause, 'id'>) => ({...c, id: `cl-${Date.now()}-${Math.random()}`})));
            setTerms(resultJson.terms.map((t: Omit<Clause, 'id'>) => ({...t, id: `term-${Date.now()}-${Math.random()}`})));
            setStep('editing');
        } catch (error) {
            console.error("Erro ao gerar contrato com IA:", error);
            alert("Ocorreu um erro ao gerar a estrutura do contrato. Verifique o console para mais detalhes e tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const inputStyle = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow";
    const labelStyle = "block text-sm font-medium text-slate-400 mb-1";

    const createClauseUpdater = useCallback(<T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (id: string, field: keyof T, value: string) => {
        setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    }, []);

    const handleClauseChange = createClauseUpdater(setClauses);
    const handleTermChange = createClauseUpdater(setTerms);

    const createItemAdder = useCallback(<T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, defaultItem: Omit<T, 'id'>) => () => {
        const newItem = { ...defaultItem, id: `item-${Date.now()}-${Math.random()}` } as T;
        setter(prev => [...prev, newItem]);
    }, []);
    
    const handleAddClause = createItemAdder(setClauses, { title: 'Nova Cláusula', content: '' });
    const handleAddTerm = createItemAdder(setTerms, { title: 'Novo Termo', content: '' });

    const createItemRemover = useCallback(<T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (id: string) => {
        setter(prev => prev.filter(item => item.id !== id));
    }, []);
    
    const handleRemoveClause = createItemRemover(setClauses);
    const handleRemoveTerm = createItemRemover(setTerms);

    const renderClientFormField = (key: keyof FormData, label: string, type = 'text') => (
        <div>
            <label htmlFor={key} className={labelStyle}>{label}</label>
            <input id={key} name={key} type={type} value={formData[key] as string} onChange={handleUpdateField} className={inputStyle} />
        </div>
    );
    
    const renderClauseEditor = (
        title: string, items: Clause[],
        onItemChange: (id: string, field: keyof Clause, value: string) => void,
        onAddItem: () => void, onRemoveItem: (id: string) => void, addBtnText: string
    ) => (
        <div>
            <h3 className="text-xl font-semibold mb-3 text-brand-gold">{title}</h3>
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="bg-slate-900/50 p-4 rounded-md transition-all">
                        <div className="flex justify-between items-center mb-2">
                            <input type="text" value={item.title} onChange={(e) => onItemChange(item.id, 'title', e.target.value)} className={`${inputStyle} font-semibold`} placeholder="Título da cláusula" />
                            <button onClick={() => onRemoveItem(item.id)} className="text-slate-400 hover:text-red-500 ml-4 p-1 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                        <textarea value={item.content} onChange={(e) => onItemChange(item.id, 'content', e.target.value)} className={`${inputStyle} h-24`} rows={4} placeholder="Conteúdo da cláusula..." />
                    </div>
                ))}
            </div>
            <button onClick={onAddItem} className="mt-4 flex items-center text-brand-primary hover:text-opacity-80 font-semibold transition-all"><PlusCircleIcon className="mr-2 h-5 w-5" />{addBtnText}</button>
        </div>
    );

    return (
        <>
            <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
                <ContractDocument id="contract-pdf-source" formData={formData} contractorData={contractorData} contractTitle={contractTitle} clauses={clauses} terms={terms} />
            </div>
            
            <div className="min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8 flex flex-col">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                        Gerador de Contratos Inteligente
                    </h1>
                    <p className="text-slate-400 mt-2">Crie, personalize e exporte contratos com facilidade.</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto w-full flex-grow">
                    {step === 'initial' ? (
                        <section className="animate-fade-in space-y-6 lg:col-span-2 max-w-3xl mx-auto w-full">
                            <div className="bg-slate-800 p-6 rounded-lg shadow-2xl">
                                <h2 className="text-2xl font-semibold mb-4 text-slate-100">1. Seus Dados (Contratada)</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="companyName" className={labelStyle}>Nome da Empresa / Seu Nome</label>
                                        <input id="companyName" name="companyName" type="text" value={contractorData.companyName} onChange={handleUpdateContractorField} className={inputStyle} placeholder="Ex: João Silva Serviços de TI" />
                                    </div>
                                    <div>
                                        <label htmlFor="companyId" className={labelStyle}>Seu CNPJ ou CPF</label>
                                        <input id="companyId" name="companyId" type="text" value={contractorData.companyId} onChange={handleUpdateContractorField} className={inputStyle} placeholder="00.000.000/0001-00" />
                                    </div>
                                    <div>
                                        <label htmlFor="companyAddress" className={labelStyle}>Seu Endereço Completo</label>
                                        <input id="companyAddress" name="companyAddress" type="text" value={contractorData.companyAddress} onChange={handleUpdateContractorField} className={inputStyle} placeholder="Rua das Flores, 123, São Paulo - SP" />
                                    </div>
                                </div>
                            </div>
                             <div className="bg-slate-800 p-6 rounded-lg shadow-2xl">
                                <h2 className="text-2xl font-semibold mb-4 text-slate-100">2. Descreva o Contrato</h2>
                                 <textarea
                                    value={contractDescription}
                                    onChange={(e) => setContractDescription(e.target.value)}
                                    placeholder="Descreva o serviço a ser prestado. Ex: 'Um contrato para gestão de redes sociais, incluindo 3 posts por semana no Instagram e 1 relatório mensal de desempenho.'"
                                    className="w-full h-36 p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow"
                                    aria-label="Descrição do tipo de contrato"
                                />
                                <div className="mt-4">
                                    <button
                                        onClick={handleGenerateContractStructure}
                                        disabled={isGenerating || !contractDescription.trim() || !contractorData.companyName}
                                        className="bg-brand-primary hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? <LoadingIcon className="animate-spin h-5 w-5 mr-2" /> : <SparklesIcon className="mr-2 h-5 w-5" />}
                                        {isGenerating ? 'Gerando...' : 'Gerar Estrutura com IA'}
                                    </button>
                                </div>
                            </div>
                        </section>
                    ) : (
                    <>
                        <section className="animate-fade-in space-y-6">
                            <div className="bg-slate-800 p-6 rounded-lg shadow-2xl">
                                <div className="text-center animate-fade-in">
                                    <h2 className="text-2xl font-semibold mb-4 text-slate-100">Estrutura Gerada!</h2>
                                    <p className="text-slate-400 mb-6">Ajuste os detalhes, insira os dados do cliente e gere o PDF.</p>
                                    <button onClick={handleReset} className="bg-brand-secondary hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center w-full">
                                        <RefreshIcon className="mr-2 h-5 w-5" />
                                        Começar de Novo
                                    </button>
                                </div>
                            </div>

                             <div className="bg-slate-800 p-6 rounded-lg shadow-2xl animate-slide-up">
                                <h2 className="text-2xl font-semibold mb-4 text-slate-100">1. Dados da Contratada</h2>
                                 <div className="space-y-4">
                                     <div><label htmlFor="companyName" className={labelStyle}>Nome da Empresa / Seu Nome</label><input id="companyName" name="companyName" type="text" value={contractorData.companyName} onChange={handleUpdateContractorField} className={inputStyle}/></div>
                                     <div><label htmlFor="companyId" className={labelStyle}>Seu CNPJ ou CPF</label><input id="companyId" name="companyId" type="text" value={contractorData.companyId} onChange={handleUpdateContractorField} className={inputStyle}/></div>
                                     <div><label htmlFor="companyAddress" className={labelStyle}>Seu Endereço Completo</label><input id="companyAddress" name="companyAddress" type="text" value={contractorData.companyAddress} onChange={handleUpdateContractorField} className={inputStyle}/></div>
                                 </div>
                             </div>

                            <div className="bg-slate-800 p-6 rounded-lg shadow-2xl animate-slide-up">
                                <h2 className="text-2xl font-semibold mb-4 text-slate-100">2. Dados do Cliente (Contratante)</h2>
                                <textarea value={rawText} onChange={handleRawTextChange} placeholder="Cole aqui o texto com as informações do cliente para preencher o formulário abaixo." className="w-full h-32 p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow" aria-label="Dados do cliente para preenchimento do contrato" />
                                <button onClick={handleParseData} disabled={!rawText.trim()} className="mt-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center w-full disabled:opacity-50 disabled:cursor-not-allowed">
                                    <PlayIcon className="mr-2 h-5 w-5" /> Analisar e Preencher
                                </button>
                                {isParsed && (
                                    <div className="mt-6 border-t border-slate-700 pt-4">
                                        <h3 className="text-lg font-semibold mb-3 text-slate-200">Confirmar Dados do Cliente</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {renderClientFormField('name', 'Nome Completo')}
                                            {renderClientFormField('email', 'Email', 'email')}
                                            {renderClientFormField('phone', 'Telefone', 'tel')}
                                            {renderClientFormField('cpf', 'CPF')}
                                            {renderClientFormField('rg', 'RG')}
                                            {renderClientFormField('birthDate', 'Data de Nascimento')}
                                            {renderClientFormField('address', 'Endereço Completo')}
                                            {renderClientFormField('instagram', 'Instagram')}
                                            {renderClientFormField('course', 'Curso / Serviço Adquirido')}
                                            {renderClientFormField('paymentMethod', 'Forma de Pagamento')}
                                            {renderClientFormField('howFound', 'Como Encontrou')}
                                            <div className="md:col-span-2"><label htmlFor="signatureConfirmation" className={labelStyle}>Frase de Assinatura</label><textarea id="signatureConfirmation" name="signatureConfirmation" value={formData.signatureConfirmation} onChange={handleUpdateField} className={`${inputStyle} h-20`} rows={3}/></div>
                                        </div>
                                        <div className="mt-6 border-t border-slate-700 pt-4"><label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" name="isMinor" checked={formData.isMinor} onChange={handleUpdateField} className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/><span className="text-slate-300">Cliente é menor de idade?</span></label></div>
                                        {formData.isMinor && (
                                            <div className="mt-4 p-4 bg-slate-900/50 rounded-md space-y-4 animate-fade-in">
                                                <h3 className="text-lg font-semibold text-brand-gold">Dados do Responsável Legal</h3>
                                                {renderClientFormField('parentName', 'Nome do Responsável')}
                                                {renderClientFormField('parentCpf', 'CPF do Responsável')}
                                                {renderClientFormField('parentRg', 'RG do Responsável')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="bg-slate-800 p-6 rounded-lg shadow-2xl animate-slide-up">
                                <h2 className="text-2xl font-semibold mb-4 text-slate-100">3. Personalize o Contrato</h2>
                                <div className="space-y-6">
                                    {renderClauseEditor("Cláusulas Principais", clauses, handleClauseChange, handleAddClause, handleRemoveClause, "Adicionar Cláusula")}
                                    <div className="border-t border-slate-700 pt-6">{renderClauseEditor("Termos e Condições Gerais", terms, handleTermChange, handleAddTerm, handleRemoveTerm, "Adicionar Termo")}</div>
                                </div>
                            </div>
                        </section>

                        <section className="animate-fade-in [animation-delay:0.2s] lg:sticky top-8 self-start">
                            <div className="bg-slate-800 p-6 rounded-lg shadow-2xl">
                               <div className="flex justify-between items-center mb-4">
                                 <h2 className="text-2xl font-semibold text-slate-100">4. Pré-visualização</h2>
                                 <button onClick={handleGeneratePdf} disabled={isLoading} className="bg-brand-gold hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 w-40">
                                    {isLoading ? <LoadingIcon className="animate-spin h-5 w-5" /> : <FileIcon className="mr-2 h-5 w-5" />}
                                    <span className={isLoading ? 'ml-2' : ''}>{isLoading ? 'Gerando...' : 'Gerar PDF'}</span>
                                 </button>
                               </div>
                                <div className="h-[80vh] overflow-y-auto bg-slate-600 rounded-md p-2 ring-1 ring-slate-700">
                                    <div className="transform scale-[0.6] sm:scale-[0.75] md:scale-[0.9] lg:scale-[0.7] xl:scale-[0.8] origin-top-left">
                                        <ContractDocument id="contract-preview-visible" formData={formData} contractorData={contractorData} contractTitle={contractTitle} clauses={clauses} terms={terms} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                    )}
                </main>
                <footer className="text-center py-6 border-t border-slate-800 mt-12">
                    <a href="https://www.instagram.com/InteligenciArte.IA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-slate-400 hover:text-brand-secondary transition-colors text-sm">
                        Desenvolvido por @InteligenciArte.IA <InstagramIcon className="ml-2 h-4 w-4" />
                    </a>
                </footer>
            </div>
        </>
    );
};

export default App;
