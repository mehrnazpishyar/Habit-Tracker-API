export function getErrorMessage(error) {
  const data = error.response?.data;

  if (data?.details?.length) {
    return data.details.map((detail) => detail.message).join(' ');
  }

  return data?.error || 'Etwas ist schiefgelaufen. Bitte später erneut versuchen.';
}