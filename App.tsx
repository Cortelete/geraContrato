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
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
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

const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
                                    required: ['title', 'content'],
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
                                    required: ['title', 'content'],
                                }
                            }
                        },
                         required: ['title', 'clauses', 'terms'],
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
    
    const inputStyle = "w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:outline-none transition-all";
    const labelStyle = "block text-sm font-medium text-slate-400 mb-2";

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

    const renderClientFormField = (key: keyof FormData, label: string, type = 'text', containerClass = '') => (
        <div className={containerClass}>
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
            <h3 className="text-xl font-semibold mb-4 text-slate-200">{title}</h3>
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 transition-all">
                        <div className="flex justify-between items-center mb-3">
                            <input type="text" value={item.title} onChange={(e) => onItemChange(item.id, 'title', e.target.value)} className={`${inputStyle} text-base font-semibold`} placeholder="Título da cláusula" />
                            <button onClick={() => onRemoveItem(item.id)} className="text-slate-500 hover:text-red-500 ml-4 p-1 transition-colors flex-shrink-0"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                        <textarea value={item.content} onChange={(e) => onItemChange(item.id, 'content', e.target.value)} className={`${inputStyle} h-28 text-sm`} rows={4} placeholder="Conteúdo da cláusula..." />
                    </div>
                ))}
            </div>
            <button onClick={onAddItem} className="mt-4 flex items-center text-brand-teal hover:text-opacity-80 font-semibold transition-all group"><PlusCircleIcon className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />{addBtnText}</button>
        </div>
    );

    return (
        <>
            <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
                <ContractDocument id="contract-pdf-source" formData={formData} contractorData={contractorData} contractTitle={contractTitle} clauses={clauses} terms={terms} />
            </div>
            
            <div className="min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8 flex flex-col">
                <header className="text-center mb-10 md:mb-16">
                    <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                        Gerador de Contratos IA
                    </h1>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-screen-2xl mx-auto w-full flex-grow">
                    {step === 'initial' ? (
                        <section className="animate-fade-in lg:col-span-5 max-w-4xl mx-auto w-full">
                           <div className="text-center mb-12">
                               <h2 className="text-3xl font-bold text-slate-100 sm:text-4xl">Crie Contratos Sob Medida em Segundos</h2>
                               <p className="mt-4 text-lg text-slate-400">Descreva sua necessidade e nossa IA gerará uma base sólida e profissional para seu acordo legal.</p>
                           </div>
                           
                           <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl mb-8 animate-slide-in-up">
                               <div className="flex items-start space-x-4">
                                   <div className="bg-brand-primary/20 text-brand-primary rounded-full p-2"><LightbulbIcon className="h-6 w-6"/></div>
                                   <div>
                                       <h3 className="text-lg font-semibold text-slate-100">Como Escrever um Bom Prompt?</h3>
                                       <p className="text-slate-400 mt-1 mb-4 text-sm">Para a IA gerar o contrato ideal, seja claro e específico. Quanto mais detalhes, melhor o resultado.</p>
                                       <ul className="list-disc list-inside text-slate-400 space-y-2 text-sm">
                                           <li><strong>Seja Específico:</strong> Em vez de "marketing", diga "gestão de mídias sociais para Instagram e Facebook".</li>
                                           <li><strong>Inclua Entregáveis:</strong> Mencione quantidades, como "3 posts por semana e 1 relatório mensal".</li>
                                           <li><strong>Defina Prazos e Pagamentos:</strong> Ex: "contrato de 6 meses com pagamento mensal de R$1.500".</li>
                                       </ul>
                                       <p className="text-slate-500 mt-3 text-xs italic">Exemplo: "Um contrato para desenvolver um site institucional para uma cafeteria. Incluir 5 páginas (Home, Sobre, Menu, Contato, Blog), design responsivo e entrega em 45 dias."</p>
                                   </div>
                               </div>
                           </div>

                           <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl mb-8 animate-slide-in-up" style={{ animationDelay: '0.15s' }}>
                               <h3 className="text-2xl font-bold mb-5 text-slate-100">1. Seus Dados (Contratada)</h3>
                               <div className="space-y-4">
                                   <input id="companyName" name="companyName" type="text" value={contractorData.companyName} onChange={handleUpdateContractorField} className={inputStyle} placeholder="Nome da Empresa / Seu Nome Completo" />
                                   <div className="grid md:grid-cols-2 gap-4">
                                       <input id="companyId" name="companyId" type="text" value={contractorData.companyId} onChange={handleUpdateContractorField} className={inputStyle} placeholder="Seu CNPJ ou CPF" />
                                       <input id="companyAddress" name="companyAddress" type="text" value={contractorData.companyAddress} onChange={handleUpdateContractorField} className={inputStyle} placeholder="Seu Endereço Completo" />
                                   </div>
                               </div>
                           </div>

                           <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                               <h3 className="text-2xl font-bold mb-5 text-slate-100">2. Descreva o Contrato</h3>
                               <textarea value={contractDescription} onChange={(e) => setContractDescription(e.target.value)} placeholder="Ex: Contrato de social media, com 3 posts por semana..." className={`${inputStyle} h-36 text-base`} aria-label="Descrição do tipo de contrato"/>
                               <div className="mt-6">
                                   <button onClick={handleGenerateContractStructure} disabled={isGenerating || !contractDescription.trim() || !contractorData.companyName} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow disabled:animate-none">
                                       {isGenerating ? <LoadingIcon className="animate-spin h-6 w-6 mr-3" /> : <SparklesIcon className="mr-3 h-6 w-6" />}
                                       {isGenerating ? 'Gerando Estrutura...' : 'Gerar com IA'}
                                   </button>
                               </div>
                           </div>
                        </section>
                    ) : (
                    <>
                        {/* Left Column */}
                        <section className="lg:col-span-3 space-y-8">
                             <div className="bg-slate-800 p-6 rounded-xl shadow-2xl animate-slide-in-up">
                                <h2 className="text-2xl font-bold mb-2 text-slate-100">Estrutura Gerada!</h2>
                                <p className="text-slate-400 mb-4">Agora, personalize os detalhes, adicione os dados do cliente e finalize seu contrato.</p>
                                <button onClick={handleReset} className="border border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center w-full">
                                    <RefreshIcon className="mr-2 h-5 w-5" />
                                    Começar de Novo
                                </button>
                            </div>

                            <div className="bg-slate-800 p-6 rounded-xl shadow-2xl animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                                <h3 className="text-xl font-semibold mb-4 text-slate-200">1. Dados da Contratada</h3>
                                 <div className="space-y-4">
                                     <div><label htmlFor="companyName" className={labelStyle}>Nome da Empresa / Seu Nome</label><input id="companyName" name="companyName" type="text" value={contractorData.companyName} onChange={handleUpdateContractorField} className={inputStyle}/></div>
                                     <div className="grid md:grid-cols-2 gap-4">
                                        <div><label htmlFor="companyId" className={labelStyle}>Seu CNPJ ou CPF</label><input id="companyId" name="companyId" type="text" value={contractorData.companyId} onChange={handleUpdateContractorField} className={inputStyle}/></div>
                                        <div><label htmlFor="companyAddress" className={labelStyle}>Seu Endereço Completo</label><input id="companyAddress" name="companyAddress" type="text" value={contractorData.companyAddress} onChange={handleUpdateContractorField} className={inputStyle}/></div>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="bg-slate-800 p-6 rounded-xl shadow-2xl animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                                <h3 className="text-xl font-semibold mb-4 text-slate-200">2. Dados do Cliente (Contratante)</h3>
                                <textarea value={rawText} onChange={handleRawTextChange} placeholder="Cole aqui o texto com as informações do cliente para preencher o formulário abaixo." className={`${inputStyle} h-32`} aria-label="Dados do cliente" />
                                <button onClick={handleParseData} disabled={!rawText.trim()} className="mt-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center w-full disabled:opacity-50 disabled:cursor-not-allowed">
                                    <PlayIcon className="mr-2 h-5 w-5" /> Analisar e Preencher
                                </button>
                                {isParsed && (
                                    <div className="mt-6 border-t border-slate-700 pt-6 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {renderClientFormField('name', 'Nome Completo')}
                                            {renderClientFormField('email', 'Email', 'email')}
                                            {renderClientFormField('phone', 'Telefone', 'tel')}
                                            {renderClientFormField('cpf', 'CPF')}
                                            {renderClientFormField('rg', 'RG')}
                                            {renderClientFormField('birthDate', 'Data de Nascimento')}
                                            {renderClientFormField('address', 'Endereço Completo', 'text', 'md:col-span-2')}
                                            {renderClientFormField('course', 'Curso / Serviço Adquirido')}
                                            {renderClientFormField('paymentMethod', 'Forma de Pagamento')}
                                        </div>
                                        <div><label htmlFor="signatureConfirmation" className={labelStyle}>Frase de Assinatura</label><textarea id="signatureConfirmation" name="signatureConfirmation" value={formData.signatureConfirmation} onChange={handleUpdateField} className={`${inputStyle} h-20`} rows={3}/></div>
                                        <div className="pt-2"><label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" name="isMinor" checked={formData.isMinor} onChange={handleUpdateField} className="h-5 w-5 rounded border-slate-500 bg-slate-700 text-brand-primary focus:ring-brand-primary"/><span className="text-slate-300">Cliente é menor de idade?</span></label></div>
                                        {formData.isMinor && (
                                            <div className="p-4 bg-slate-900/50 rounded-lg space-y-4 animate-fade-in border border-brand-gold/20">
                                                <h4 className="text-lg font-semibold text-brand-gold">Dados do Responsável Legal</h4>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                {renderClientFormField('parentName', 'Nome do Responsável')}
                                                {renderClientFormField('parentCpf', 'CPF do Responsável')}
                                                {renderClientFormField('parentRg', 'RG do Responsável', 'text', 'md:col-span-2')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-800 p-6 rounded-xl shadow-2xl animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                                <h3 className="text-xl font-semibold mb-4 text-slate-200">3. Personalize o Contrato</h3>
                                <div className="space-y-8">
                                    {renderClauseEditor("Cláusulas Principais", clauses, handleClauseChange, handleAddClause, handleRemoveClause, "Adicionar Cláusula")}
                                    <div className="border-t border-slate-700 pt-8">{renderClauseEditor("Termos e Condições Gerais", terms, handleTermChange, handleAddTerm, handleRemoveTerm, "Adicionar Termo")}</div>
                                </div>
                            </div>
                        </section>

                        {/* Right Column */}
                        <section className="lg:col-span-2 lg:sticky top-8 self-start animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
                               <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                                 <h2 className="text-2xl font-bold text-slate-100">Pré-visualização</h2>
                                 <button onClick={handleGeneratePdf} disabled={isLoading} className="bg-brand-gold hover:bg-opacity-90 text-slate-900 font-bold py-2 px-5 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 w-full sm:w-auto flex-shrink-0">
                                    {isLoading ? <LoadingIcon className="animate-spin h-5 w-5" /> : <FileIcon className="mr-2 h-5 w-5" />}
                                    <span className={isLoading ? 'ml-2' : ''}>{isLoading ? 'Gerando...' : 'Gerar PDF'}</span>
                                 </button>
                               </div>
                                <div className="h-[75vh] overflow-y-auto bg-slate-600 rounded-lg p-1 sm:p-2 ring-1 ring-slate-700">
                                    <div className="transform scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.6] xl:scale-[0.75] origin-top">
                                        <ContractDocument id="contract-preview-visible" formData={formData} contractorData={contractorData} contractTitle={contractTitle} clauses={clauses} terms={terms} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                    )}
                </main>
                <footer className="text-center py-6 border-t border-slate-800 mt-12">
                    <a href="https://www.instagram.com/InteligenciArte.IA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-slate-500 hover:text-brand-secondary transition-colors text-sm">
                        Desenvolvido por @InteligenciArte.IA <InstagramIcon className="ml-2 h-4 w-4" />
                    </a>
                </footer>
            </div>
        </>
    );
};

export default App;
