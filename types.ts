export interface FormData {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    rg: string;
    birthDate: string;
    address: string;
    instagram: string;
    course: string; // Repurposed for "Service/Product"
    paymentMethod: string;
    howFound: string;
    termsAccepted: string;
    signatureConfirmation: string;
    isMinor: boolean;
    parentName: string;
    parentCpf: string;
    parentRg: string;
}

export interface ContractorData {
    companyName: string;
    companyId: string; // For CNPJ or CPF
    companyAddress: string;
}

export interface Clause {
    id: string;
    title: string;
    content: string;
}
