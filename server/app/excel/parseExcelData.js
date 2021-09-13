const xlsx = require('xlsx');
const db = require('../models');
const Book = db.books;

let findCellValue = (worksheet, row, col) => {
  const cell = worksheet[xlsx.utils.encode_cell({r: row, c: col})];
  return cell ? cell.v : '';
}

const parseExcelData = () => {
  const filePath = __dirname + '/books_export.xlsx';
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  let range = xlsx.utils.decode_range(worksheet['!ref']);

  let books = [];
  let book = {};

  for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
    const title = findCellValue(worksheet, rowNum, 0);
    const author = findCellValue(worksheet, rowNum, 2);
    const publisher = findCellValue(worksheet, rowNum, 3);
    const genre = findCellValue(worksheet, rowNum, 1);

    book.title = title;
    book.author = author;
    book.publisher = publisher;
    book.genre = genre;
    book.availability = 0;

    books.push(book);
    book = {};
  }

  Book.destroy({
    where: {},
    truncate: false
  }).then(() => {
    Book.bulkCreate(books).then(() => {
      console.log("Data parsed");
    });
  })
}

parseExcelData();

module.exports = parseExcelData;
