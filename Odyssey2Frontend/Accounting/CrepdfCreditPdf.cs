/*RP. TASK CREDIT MEMO*/
using System;
using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Tables;
using MigraDoc.DocumentObjectModel.Shapes;
using MigraDoc.Rendering;
using System.IO;
using Odyssey2Frontend.Models;
using System.Net;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: December 15, 2020.

namespace Odyssey2Frontend.Accounting
{
    public class CrepdfCreditPdf
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES

        private Document document = null;
        private Section section = null;
        private CreditMemoForPDFModel cremem = null;

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //--------------------------------------------------------------------------------------------------------------
        public CrepdfCreditPdf(
            CreditMemoForPDFModel cremem_I
            )
        {
            this.cremem = cremem_I;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //--------------------------------------------------------------------------------------------------------------
        public byte[] arrbyteGenerateCreditMemo()
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
            this.subCreateMemo();

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
        private void subCreateMemo()
        {
            this.section = this.document.AddSection();
            this.section.PageSetup.PageFormat = PageFormat.Letter;

            this.subCreateHeader();

            this.subCreateTermsTable();
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateHeader()
        {
            Paragraph paragraph = null;
            String[] darrstrAddressLines = null;

            //                                              //Left data
            //                                              //Title ship config.
            TextFrame textFrame = section.AddTextFrame();
            textFrame.Height = "15.0cm";
            textFrame.Width = "6.0cm";
            textFrame.Left = ShapePosition.Left;
            textFrame.RelativeHorizontal = RelativeHorizontal.Margin;
            textFrame.Top = "1.0cm";
            textFrame.RelativeVertical = RelativeVertical.Page;

            if (
                !String.IsNullOrEmpty(cremem.strLogoUrl)
                )
            {
                Image imageLogo = textFrame.AddImage("base64:" + Convert.ToBase64String(arrbyteGetLogoImage()));
                imageLogo.Height = Unit.FromCentimeter(1.7);

                paragraph = textFrame.AddParagraph();
                paragraph.AddFormattedText("\n");
            }

            //                                              //Title shipp info.
            paragraph = textFrame.AddParagraph();
            paragraph.AddFormattedText("CREDIT TO: \n", TextFormat.Bold);
            if (
                !String.IsNullOrEmpty(cremem.strCustomerFullName)
                )
            {
                paragraph.AddFormattedText(cremem.strCustomerFullName + "\n");
            }

            if (
                !String.IsNullOrEmpty(cremem.strBilledTo)
                )
            {
                darrstrAddressLines = cremem.strBilledTo.Split("\n");
                foreach (String strBilledToLine in darrstrAddressLines)
                {
                    paragraph.AddFormattedText(strBilledToLine + "\n");
                }
            }
            else
            {
                paragraph.AddFormattedText("\n");
            }


            paragraph.Format.Alignment = ParagraphAlignment.Left;
            paragraph.Format.Font.Size = 10;

            //                                              //Title section config.
            textFrame = section.AddTextFrame();
            textFrame.Height = "15.0cm";
            textFrame.Width = "6.0cm";
            textFrame.Left = ShapePosition.Right;
            textFrame.RelativeHorizontal = RelativeHorizontal.Margin;
            textFrame.Top = "1.0cm";
            textFrame.RelativeVertical = RelativeVertical.Page;

            //                                              //Title section info.
            paragraph = textFrame.AddParagraph();
            paragraph.AddFormattedText("\n\n\n\n\n");
            paragraph.AddFormattedText("Credit # ", TextFormat.Bold);
            paragraph.AddFormattedText((cremem.strCreditMemoNumber ?? "-") + "\n");
            paragraph.AddFormattedText("Date: ", TextFormat.Bold);
            paragraph.AddFormattedText((cremem.strDate ?? "-") + "\n");

            paragraph.Format.Alignment = ParagraphAlignment.Left;
            paragraph.Format.Font.Size = 10;

            //                                              //Space between the titles and de table.
            textFrame = section.AddTextFrame();
            textFrame.Height = "6.0cm";
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private byte[] arrbyteGetLogoImage()
        {
            byte[] arrbyteLogoImage = null;

            using (WebClient webClient = new WebClient())
            {
                arrbyteLogoImage = webClient.DownloadData("http://" + cremem.strLogoUrl);
            }

            return arrbyteLogoImage;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateTermsTable()
        {
            //                                              //Terms information table config.
            Table tabTermsInfo = this.section.AddTable();
            tabTermsInfo.Style = "Table";
            tabTermsInfo.Borders.Color = Color.FromRgb(0, 0, 0);
            tabTermsInfo.Borders.Width = 0;

            //                                              //Create the table columns.
            Column colTablecols = tabTermsInfo.AddColumn("15.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabTermsInfo.AddColumn("4.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;


            //                                              //Add a new row for the table headers.
            Row rowHeader = tabTermsInfo.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(79, 154, 202);
            rowHeader.Format.Font.Size = 10;
            rowHeader.Shading.Color = Color.FromRgb(220, 233, 241);

            //                                              //Activity Information column configuration.
            Paragraph parActivityInformation = rowHeader.Cells[0].AddParagraph();
            parActivityInformation.AddFormattedText("ACTIVITY", TextFormat.Bold);
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[0].VerticalAlignment = VerticalAlignment.Center;
            
            //                                              //Amount Information column configuration.
            Paragraph parAmount = rowHeader.Cells[1].AddParagraph();
            parAmount.AddFormattedText("AMOUNT", TextFormat.Bold);
            rowHeader.Cells[1].Format.Alignment = ParagraphAlignment.Right;
            rowHeader.Cells[1].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Each function add information to their respective column.
            Row rowCredit = tabTermsInfo.AddRow();
            rowCredit.Format.Font.Size = 10;
            rowCredit.Format.Alignment = ParagraphAlignment.Left;

            rowCredit.Cells[0].AddParagraph(cremem.strDescription ?? "-");
            rowCredit.Cells[1].AddParagraph(cremem.numAmount.ToString("C2"));
            rowCredit.Cells[1].Format.Alignment = ParagraphAlignment.Right;

            //                                              //Each function add information to their respective column.
            rowCredit = tabTermsInfo.AddRow();
            rowCredit = tabTermsInfo.AddRow();
            rowCredit.Format.Font.Size = 12;
            rowCredit.Format.Font.Bold = true;
            rowCredit.Format.Alignment = ParagraphAlignment.Right;

            rowCredit.Cells[0].AddParagraph("TOTAL CREDIT");
            rowCredit.Cells[1].AddParagraph(cremem.numAmount.ToString("C2"));

            TextFrame spaceBetweenTextFrame = section.AddTextFrame();
            spaceBetweenTextFrame.Height = "0.5cm";
        }

        //--------------------------------------------------------------------------------------------------------------
    }
}
/*END-TASK*/
