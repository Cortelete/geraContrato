// @ts-nocheck
export const generatePdf = async (elementId: string, fileName: string, contractorName: string, contractorAddress: string): Promise<void> => {
    const input = document.getElementById(elementId);
    if (!input) {
        console.error(`Element with id ${elementId} not found.`);
        return;
    }

    const { jsPDF } = window.jspdf;

    try {
        const canvas = await html2canvas(input, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            // By setting width/height to scrollWidth/scrollHeight, we capture the entire content
            width: input.scrollWidth,
            height: input.scrollHeight,
        });

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Margins in mm to reserve space for header and footer
        const topMargin = 20;
        const bottomMargin = 20;
        const contentAreaHeight = pdfHeight - topMargin - bottomMargin;
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        let canvasPosition = 0; // The Y-position on the source canvas we've processed so far, in pixels.
        let pageCount = 0;

        while (canvasPosition < canvasHeight) {
            pageCount++;
            // The first page is created by default, for subsequent pages, add a new one.
            if (pageCount > 1) {
                pdf.addPage();
            }
            
            // The height of the slice to take from the canvas, in canvas pixels.
            // This is equivalent to one page of content in the PDF.
            const sliceHeight = contentAreaHeight * (canvasWidth / pdfWidth);

            // Create a temporary canvas to hold the slice of the full contract image.
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasWidth;
            // Ensure the slice doesn't go beyond the canvas boundaries for the last page
            tempCanvas.height = Math.min(sliceHeight, canvasHeight - canvasPosition); 
            const tempCtx = tempCanvas.getContext('2d');

            // Draw the slice from the source canvas onto the temporary canvas.
            tempCtx.drawImage(canvas, 
                0, canvasPosition, // Start coordinates on source canvas
                canvasWidth, Math.min(sliceHeight, canvasHeight - canvasPosition), // Size of the slice
                0, 0, // Destination coordinates on temp canvas
                canvasWidth, Math.min(sliceHeight, canvasHeight - canvasPosition) // Destination size
            );
            
            const sliceImgData = tempCanvas.toDataURL('image/png');

            // Add the image slice to the content area of the current PDF page.
            // The height is adjusted for the last page to not stretch the image.
            const sliceImgHeightInPdf = (tempCanvas.height * pdfWidth) / tempCanvas.width;
            pdf.addImage(sliceImgData, 'PNG', 0, topMargin, pdfWidth, sliceImgHeightInPdf);
            
            // Update the position on the source canvas for the next iteration.
            canvasPosition += sliceHeight;

            // Add Header to the current page.
            pdf.setFontSize(9);
            pdf.setTextColor(128); // Gray color
            pdf.text(contractorName || 'Contrato', pdfWidth / 2, 15, { align: 'center' });

            // Add Footer to the current page.
            const cityPart = contractorAddress ? contractorAddress.split(',').pop()?.trim() : "Local";
            const city = cityPart ? cityPart.split(' - ')[0] : "Local";
            const dateText = new Date().toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
            pdf.text(city, pdfWidth / 2, pdfHeight - 15, { align: 'center' });
            pdf.text(dateText, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
        }
        
        pdf.save(`${fileName}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};