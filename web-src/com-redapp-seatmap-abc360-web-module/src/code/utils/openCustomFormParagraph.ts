// file: /code/utils/openCustomFprmParagraph.ts

/**
 * openCustomFprmParagraph.ts
 *
 * 📝 Utility for quickly displaying a simple read-only paragraph in a Sabre Custom Form.
 *
 * Used to show informative messages or warnings to the user without requiring input.
 * The form includes a single PARAGRAPH field and a "Close" button.
 */

import { CustomForm } from 'sabre-ngv-custom-forms/interfaces/form/CustomForm';
import { ICustomFormsService } from 'sabre-ngv-custom-forms/services/ICustomFormsService';
import { getService } from '../Context';

/**
 * Opens a simple custom form with a paragraph of text and a "Close" button.
 *
 * @param title - Title of the popup form
 * @param msg - Message text to display in the paragraph
 */
export const openCustomFormParagraph = (title: string, msg: string): void => {
    const form: CustomForm = {
        title,
        fields: [
            {
                id: 'flight',
                type: 'PARAGRAPH',
                text: msg
            }
        ],
        actions: [
            {
                id: 'cancel',
                label: 'Close'
            }
        ]
    };

    // 📤 Display the form via Sabre's Custom Forms service
    getService(ICustomFormsService).openForm(form);
};