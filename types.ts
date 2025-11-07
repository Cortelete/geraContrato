export interface FormData {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    cnpj: string;
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
    businessName: string;
    tradeName: string;
    cnpj: string;
    cpf: string;
    email: string;
    cep: string;
    streetAddress: string;
    city: string;
}

export interface Clause {
    id: string;
    title: string;
    content: string;
}