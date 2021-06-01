/*R.P. TASK BANK DEPOSIT PDF*/
using System;
using System.Collections.Generic;
using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Tables;
using MigraDoc.DocumentObjectModel.Shapes;
using MigraDoc.Rendering;
using System.IO;
using Odyssey2Frontend.Models;
using System.Net;
using System.Linq;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: December 15, 2020.

namespace Odyssey2Frontend.Accounting
{
    //==================================================================================================================
    public class BanDeppdfBankDepositPdf
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES

        private Document document = null;
        private Section section = null;
        private BankDepositSummaryModel bandepsum = null;

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //--------------------------------------------------------------------------------------------------------------
        public BanDeppdfBankDepositPdf(
            BankDepositSummaryModel bandepsum_I
            )
        {
            this.bandepsum = bandepsum_I;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //--------------------------------------------------------------------------------------------------------------
        public byte[] arrbyteGenerateBankDepositSummary()
        {
            //                                              //Create a new document.
            this.document = new Document();

            //                                              //Set the pege orientation.
            this.document.DefaultPageSetup.LeftMargin = 35;
            this.document.DefaultPageSetup.RightMargin = 35;
            this.document.DefaultPageSetup.TopMargin = 35;
            this.document.DefaultPageSetup.BottomMargin = 35;

            //                                              //This functions set the values for the bullet on the
            //                                              //      estimation table.
            this.subSetStyles();

            //                                              //This function call all the functions to create the ticket.
            this.subCreateSummary();

            //                                              //Render the document.
            PdfDocumentRenderer pdfRenderer = new PdfDocumentRenderer(false);
            pdfRenderer.Document = this.document;
            pdfRenderer.RenderDocument();

            //                                              //Parse the document to array of bytes.
            byte[] arrByte = null;
            using (MemoryStream stream = new MemoryStream())
            {
                pdfRenderer.Save(stream, true);
                arrByte = stream.ToArray();
            }

            //                                              //Return the array of bytes.
            return arrByte;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subSetStyles()
        {
            Style style = this.document.Styles["Normal"];

            //                                              //Bullet style config.
            style = document.AddStyle("Bullet", "Normal");
            style.ParagraphFormat.LeftIndent = "0.5cm";

            //                                              //Bullet style config.
            style = document.AddStyle("BulletLevel2", "Normal");
            style.ParagraphFormat.LeftIndent = "1.0cm";

            //                                              //Bullet style config.
            style = document.AddStyle("BulletLevel3", "Normal");
            style.ParagraphFormat.LeftIndent = "1.5cm";

            //                                              //Bullet style config.
            style = document.AddStyle("BulletLevel4", "Normal");
            style.ParagraphFormat.LeftIndent = "2.0cm";

            //                                              //Bullet style config.
            style = document.AddStyle("BulletLevel5", "Normal");
            style.ParagraphFormat.LeftIndent = "2.5cm";
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateSummary()
        {
            this.section = this.document.AddSection();
            this.section.PageSetup.PageFormat = PageFormat.Letter;

            this.subCreateHeader();

            this.subCreateDetails();
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateHeader()
        {
            Paragraph paragraph = null;

            //                                              //Left data
            //                                              //Title ship config.
            TextFrame textFrame = section.AddTextFrame();
            textFrame.Height = "3.0cm";
            textFrame.Width = "19.0cm";
            textFrame.Left = ShapePosition.Left;
            textFrame.RelativeHorizontal = RelativeHorizontal.Margin;
            textFrame.Top = "1.0cm";
            textFrame.RelativeVertical = RelativeVertical.Page;

            //                                              //Title info.
            paragraph = textFrame.AddParagraph();
            paragraph.AddFormattedText("Deposit Summary\n", TextFormat.Bold);
            paragraph.Format.Alignment = ParagraphAlignment.Center;
            paragraph.Format.Font.Size = 20;

            //                                              //Title section info.
            paragraph = textFrame.AddParagraph((bandepsum.strDate ?? "-") + "\n");
            paragraph.Format.Alignment = ParagraphAlignment.Right;
            paragraph.Format.Font.Size = 8;

            //                                              //Title section info.
            paragraph = textFrame.AddParagraph("Summary of Deposits to " + (bandepsum.strBankAccountName ?? "") +
                " on " + (bandepsum.strDate ?? "") + "\n");
            paragraph.Format.Alignment = ParagraphAlignment.Left;
            paragraph.Format.Font.Size = 8;

            //                                              //Space between the titles and de table.
            textFrame = section.AddTextFrame();
            textFrame.Height = "2.0cm";
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateDetails()
        {
            //                                              //Terms information table config.
            Table tabDeposits = this.section.AddTable();
            tabDeposits.Style = "Table";
            tabDeposits.Borders.Color = Color.FromRgb(0, 0, 0);
            tabDeposits.Borders.Width = 0;

            //                                              //Create the table columns.
            Column colCheckNumber = tabDeposits.AddColumn("5.0cm");
            colCheckNumber.Format.Alignment = ParagraphAlignment.Left;

            Column colPaymentMethod = tabDeposits.AddColumn("5.0cm");
            colPaymentMethod.Format.Alignment = ParagraphAlignment.Left;

            Column colReceivedFrom = tabDeposits.AddColumn("5.0cm");
            colReceivedFrom.Format.Alignment = ParagraphAlignment.Left;

            Column colMemo = tabDeposits.AddColumn("0.5cm");
            colMemo.Format.Alignment = ParagraphAlignment.Left;
            
            Column colAmount = tabDeposits.AddColumn("3.5cm");
            colAmount.Format.Alignment = ParagraphAlignment.Right;

            //                                              //Add a new row for the table headers.
            Row rowHeader = tabDeposits.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(0, 0, 0);
            rowHeader.Format.Font.Size = 10;
            rowHeader.Shading.Color = Color.FromRgb(186, 186, 186);

            //                                              //Check number column configuration.
            Paragraph parCheckNumber = rowHeader.Cells[0].AddParagraph();
            parCheckNumber.AddFormattedText("REFERENCE NO.", TextFormat.Bold);
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[0].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Payment method column configuration.
            Paragraph parPaymentMethod = rowHeader.Cells[1].AddParagraph();
            parPaymentMethod.AddFormattedText("PTM METHOD", TextFormat.Bold);
            rowHeader.Cells[1].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[1].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Received from column configuration.
            Paragraph parReceivedFrom = rowHeader.Cells[2].AddParagraph();
            parReceivedFrom.AddFormattedText("RECEIVED FROM", TextFormat.Bold);
            rowHeader.Cells[2].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[2].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Memo column configuration.
            Paragraph parMemo = rowHeader.Cells[3].AddParagraph();
            parMemo.AddFormattedText("AMOUNT", TextFormat.Bold);
            rowHeader.Cells[3].MergeRight = 1;
            rowHeader.Cells[3].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[3].VerticalAlignment = VerticalAlignment.Center;

            this.subPrintDeposits(tabDeposits);
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subPrintDeposits(
            Table tabDeposits
            )
        {
            Row rowDeposit = null;

            foreach (DepositPaymentModel depostpayment in bandepsum.arrPayments)
            {
                rowDeposit = tabDeposits.AddRow();
                rowDeposit.Format.Font.Size = 12;
                rowDeposit.Format.Alignment = ParagraphAlignment.Left;

                rowDeposit.Cells[0].AddParagraph(depostpayment.strReference ?? "-");
                rowDeposit.Cells[1].AddParagraph(depostpayment.strMethodName ?? "-");
                rowDeposit.Cells[2].AddParagraph(depostpayment.strCustomerFullName ?? "-");
                rowDeposit.Cells[3].AddParagraph("$");
                rowDeposit.Cells[4].AddParagraph(depostpayment.numAmount.ToString("n2"));
                rowDeposit.Cells[4].Format.Alignment = ParagraphAlignment.Right;
            }

            rowDeposit = tabDeposits.AddRow();
            rowDeposit = tabDeposits.AddRow();
            rowDeposit.Format.Font.Size = 12;

            rowDeposit.Cells[2].AddParagraph("DEPOSIT TOTAL");
            rowDeposit.Cells[3].AddParagraph("$");
            rowDeposit.Cells[4].AddParagraph(bandepsum.numTotal.ToString("n2"));
            rowDeposit.Cells[4].Format.Alignment = ParagraphAlignment.Right; ;
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
