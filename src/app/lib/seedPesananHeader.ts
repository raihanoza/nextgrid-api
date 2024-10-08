// seeds/01_create_pesanan_header.js

exports.seed = async function (knex:any) {
    // Hapus semua entri yang ada
    await knex('pesanan_header').del();
  
    const data = [];
  
    for (let i = 1; i <= 300; i++) {
      data.push({
        customer: `Customer ${i}`,
        keterangan: `Keterangan ${i}`,
        tglbukti: new Date(
          Date.now() - Math.floor(Math.random() * 10000000000) // Menghasilkan tanggal acak
        ).toISOString(),
      });
    }
  
    // Menyisipkan data
    await knex('pesanan_header').insert(data);
  };
  