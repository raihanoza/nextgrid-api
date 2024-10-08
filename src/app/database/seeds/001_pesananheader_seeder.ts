// seeds/01_create_pesanan_header.js

exports.seed = async function (knex:any) {
    await knex('pesananheader').del();
    await knex('pesanandetail').del(); // Hapus data pesanandetail jika ada
  
    const pesananData = [];
    const detailData = [];
    const totalData = 300; // Jumlah total data yang ingin dimasukkan
  
    for (let i = 1; i <= totalData; i++) {
      const randomDate = new Date(
        Date.now() - Math.floor(Math.random() * 10000000000) // Menghasilkan tanggal acak
      );
  
      const formattedDate = randomDate.toISOString().split('T')[0];
  
      // Tambahkan data pesananheader
      const pesananId = await knex('pesananheader').insert({
        customer: `Customer ${i}`,
        keterangan: `Keterangan ${i}`,
        tglbukti: formattedDate,
      }).returning('id'); // Mengembalikan id yang baru ditambahkan
  
      // Tambahkan data pesanandetail untuk setiap pesanan
      for (let j = 1; j <= 5; j++) { // Misalnya, setiap pesanan memiliki 5 detail
        detailData.push({
          pesananheaderid: pesananId[0], // Menggunakan id dari pesanan_header yang baru ditambahkan
          product: `Product ${j}`,
          qty: Math.floor(Math.random() * 10) + 1, // Jumlah acak antara 1-10
          harga: Math.floor(Math.random() * 100) + 10, // Harga acak antara 10-110
        });
      }
    }
  
    // Menyisipkan data ke dalam tabel pesanandetail
    await knex('pesanandetail').insert(detailData);
    console.log(`${totalData} pesanan_header rows and ${detailData.length} pesanandetail rows inserted`);
  };
  