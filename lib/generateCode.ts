export function generateOrderCode(): string {
  // Fungsi untuk mendapatkan tanggal dalam format yang diinginkan
  function getFormattedDate(date: Date): string {
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  // Fungsi untuk menghasilkan nomor unik
  function generateUniqueNumber(): string {
    return Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
  }

  const currentDate = new Date();
  const formattedDate = getFormattedDate(currentDate);
  const uniqueNumber = generateUniqueNumber();

  return `${formattedDate}${uniqueNumber}`;
}

export function generateShipmentCode(): string {
  // Fungsi untuk mendapatkan tanggal dalam format yang diinginkan
  function getFormattedDate(date: Date): string {
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  // Fungsi untuk menghasilkan nomor unik
  function generateUniqueNumber(): string {
    return Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
  }

  const currentDate = new Date();
  const formattedDate = getFormattedDate(currentDate);
  const uniqueNumber = generateUniqueNumber();

  return `SHIP-${formattedDate}-${uniqueNumber}`;
}
