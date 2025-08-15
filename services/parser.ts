import { FormData } from '../types';

export const parseClientData = (text: string): Partial<FormData> => {
    const data: Partial<FormData> = {};
    const lines = text.split('\n');
    
    const mapping: { [key: string]: keyof FormData } = {
        'Nome': 'name',
        'Email': 'email',
        'Telefone': 'phone',
        'CPF': 'cpf',
        'RG': 'rg',
        'Data de Nascimento': 'birthDate',
        'Endereço': 'address',
        'Instagram': 'instagram',
        'Curso Escolhido': 'course',
        'Curso/Serviço': 'course',
        'Curso': 'course',
        'Serviço': 'course',
        'Forma de Pagamento': 'paymentMethod',
        'Como nos encontrou': 'howFound',
        'Termos Aceitos': 'termsAccepted',
        'Assinatura Digital': 'signatureConfirmation',
    };

    lines.forEach(line => {
        // Remove asterisks and trim whitespace
        const cleanLine = line.replace(/\*/g, '').trim();
        const parts = cleanLine.split(':');
        
        if (parts.length > 1) {
            const key = parts[0].trim();
            let value = parts.slice(1).join(':').trim();

            if (key === 'Curso Escolhido' || key === 'Curso/Serviço' || key === 'Curso' || key === 'Serviço') {
                // Extract only the course name, removing the price part
                value = value.split(' - R$')[0].trim();
            }

            if (mapping[key]) {
                const formKey = mapping[key];
                (data as any)[formKey] = value === 'Resposta' || value === 'Confirmado' ? '' : value;
                 if (formKey === 'signatureConfirmation' && value.toLowerCase() === 'confirmado') {
                    (data as any)[formKey] = "Eu, [Nome do Cliente], aceito os termos e confirmo.";
                 }
            }
        }
    });

    if (data.birthDate) {
        try {
            const [day, month, year] = data.birthDate.split('/').map(Number);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900) {
                const birthDateObj = new Date(year, month - 1, day);
                const today = new Date();
                let age = today.getFullYear() - birthDateObj.getFullYear();
                const m = today.getMonth() - birthDateObj.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
                    age--;
                }
                data.isMinor = age < 18;
            } else {
                data.isMinor = false;
            }
        } catch (e) {
            console.error("Could not parse date", e);
            data.isMinor = false;
        }
    }

    return data;
};
