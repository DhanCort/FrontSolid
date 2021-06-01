/*RP. TASK STATEMENT PDF*/
using System;
using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Tables;
using MigraDoc.DocumentObjectModel.Shapes;
using MigraDoc.Rendering;
using System.IO;
using Odyssey2Frontend.Models;
using System.Net;
using System.Globalization;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: December 16, 2020.

namespace Odyssey2Frontend.Accounting
{
    //==================================================================================================================
    public class StapdfStatementPdf
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES

        private Document document = null;
        private Section section = null;
        private StatementPdfModel stapdfmod = null;
        private String strType = null;
        public CultureInfo culture = CultureInfo.CreateSpecificCulture("en-US");

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //--------------------------------------------------------------------------------------------------------------
        public StapdfStatementPdf(
            StatementPdfModel stapdfmod_I,
            String strType_I
            )
        {
            this.stapdfmod = stapdfmod_I;
            this.strType = strType_I;
            this.culture.NumberFormat.CurrencyNegativePattern = 2; 
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //--------------------------------------------------------------------------------------------------------------

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

            //                                              //Currency format.
            CultureInfo culture = CultureInfo.CreateSpecificCulture("en-US");
            culture.NumberFormat.NumberNegativePattern = 2;

            //                                              //This function call all the functions to create the ticket.
            this.subCreateStatement();

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
        private void subCreateStatement()
        {
            this.section = this.document.AddSection();
            this.section.PageSetup.PageFormat = PageFormat.Letter;

            this.subCreateHeader();

            if (
                (this.strType == "Transaction") ||
                (this.strType == "Forward")
                )
            {
                this.subCreateFromToSection();
            }

            this.subPrintStatementTable();

            if (
                (this.strType == "Open")
                )
            {
                this.subPrintAmountDueTable();
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateHeader()
        {
            Paragraph paragraph = null;

            //                                              //Left data
            //                                              //Title ship config.
            TextFrame textFrame = section.AddTextFrame();
            textFrame.Height = "15.0cm";
            textFrame.Width = "13.0cm";
            textFrame.Left = ShapePosition.Left;
            textFrame.RelativeHorizontal = RelativeHorizontal.Margin;
            textFrame.Top = "1.0cm";
            textFrame.RelativeVertical = RelativeVertical.Page;

            if (
                !String.IsNullOrEmpty(stapdfmod.strLogoUrl)
                )
            {
                Image imageLogo = textFrame.AddImage("base64:" + Convert.ToBase64String(arrbyteGetLogoImage()));
                imageLogo.Height = Unit.FromCentimeter(1.7);

                paragraph = textFrame.AddParagraph();
                paragraph.AddFormattedText("\n");
            }

            //                                              //Estatement info.
            paragraph = textFrame.AddParagraph();
            paragraph.AddFormattedText(this.stapdfmod.strTitle + "\n\n", TextFormat.Bold);

            paragraph.Format.Alignment = ParagraphAlignment.Left;
            paragraph.Format.Font.Size = 20;

            //                                              //Billed to info.
            paragraph = textFrame.AddParagraph();
            paragraph.AddFormattedText("TO: \n", TextFormat.Bold);
            paragraph.AddFormattedText(stapdfmod.strBilledTo + "\n");

            paragraph.Format.Alignment = ParagraphAlignment.Left;
            paragraph.Format.Font.Size = 10;

            //                                              //Date section config.
            textFrame = section.AddTextFrame();
            textFrame.Height = "15.0cm";
            textFrame.Width = "6.0cm";
            textFrame.Left = ShapePosition.Right;
            textFrame.RelativeHorizontal = RelativeHorizontal.Margin;
            textFrame.Top = "1.0cm";
            textFrame.RelativeVertical = RelativeVertical.Page;

            //                                              //Date section info.
            paragraph = textFrame.AddParagraph();
            paragraph.AddFormattedText("Date: ", TextFormat.Bold);
            paragraph.AddFormattedText((stapdfmod.strDate ?? "-") + "\n");

            paragraph.Format.Alignment = ParagraphAlignment.Right;
            paragraph.Format.Font.Size = 10;

            //                                              //Space between the titles and de table.
            textFrame = section.AddTextFrame();
            textFrame.Height = "5.0cm";
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private byte[] arrbyteGetLogoImage()
        {
            byte[] arrbyteLogoImage = null;

            using (WebClient webClient = new WebClient())
            {
                arrbyteLogoImage = webClient.DownloadData("http://" + stapdfmod.strLogoUrl);
            }

            return arrbyteLogoImage;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateFromToSection()
        {
            Table tabDates = this.section.AddTable();
            tabDates.Style = "Table";
            tabDates.Borders.Width = 0;

            //                                              //Create the table columns.
            Column colTablecols = tabDates.AddColumn("9.5cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabDates.AddColumn("9.5cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;


            //                                              //Add a new row.
            Row rowHeader = tabDates.AddRow();
            rowHeader.Format.Font.Bold = true;
            //rowHeader.Format.Font.Color = Color.FromRgb(185, 183, 183);
            rowHeader.Format.Font.Size = 10;

            //                                              //From column configuration.
            Paragraph parDateFrom = rowHeader.Cells[0].AddParagraph();
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            parDateFrom.AddFormattedText("From: ", TextFormat.Bold);
            parDateFrom.AddFormattedText(stapdfmod.strDateFrom ?? "-");

            if (
                (this.strType == "Transaction")
                )
            {
                //                                              //To column configuration.
                Paragraph parDateTo = rowHeader.Cells[1].AddParagraph();
                rowHeader.Cells[1].Format.Alignment = ParagraphAlignment.Right;
                parDateTo.AddFormattedText("To: ", TextFormat.Bold);
                parDateTo.AddFormattedText(stapdfmod.strDateTo ?? "-");
            }

            TextFrame textFrame = section.AddTextFrame();
            textFrame.Height = "1.0cm";
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subPrintStatementTable()
        {
            Table tabStatement = this.section.AddTable();
            tabStatement.Style = "Table";
            tabStatement.Borders.Color = Color.FromRgb(255, 255, 255);
            tabStatement.Borders.Width = 3;

            //                                              //Create the table columns.
            Column colTablecols = tabStatement.AddColumn("3.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabStatement.AddColumn("4.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabStatement.AddColumn("4.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;

            colTablecols = tabStatement.AddColumn("0.5cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;
            colTablecols.Borders.Right.Visible = false;
            
            colTablecols = tabStatement.AddColumn("3.5cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;

            colTablecols = tabStatement.AddColumn("0.5cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;
            colTablecols.Borders.Right.Visible = false;

            colTablecols = tabStatement.AddColumn("3.5cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;

            //                                              //Add a new row for the table headers.
            Row rowHeader = tabStatement.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(79, 154, 202);
            rowHeader.Format.Font.Size = 10;
            rowHeader.Shading.Color = Color.FromRgb(220, 233, 241);

            //                                              //Order Information column configuration.
            Paragraph parDate = rowHeader.Cells[0].AddParagraph();
            parDate.AddFormattedText("DATE", TextFormat.Bold);
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[0].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Job specs column configuration.
            Paragraph parType = rowHeader.Cells[1].AddParagraph();
            parType.AddFormattedText("TYPE", TextFormat.Bold);
            rowHeader.Cells[1].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[1].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Contact column configuration.
            Paragraph parNumber = rowHeader.Cells[2].AddParagraph();
            parNumber.AddFormattedText("NUMBER", TextFormat.Bold);
            rowHeader.Cells[2].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[2].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Delivery column configuration.
            Paragraph parChargesOrAmount = rowHeader.Cells[3].AddParagraph();
            if (
                (this.strType == "Forward")
                )
            {
                parChargesOrAmount.AddFormattedText("AMOUNT", TextFormat.Bold);
            }
            else
            {
                parChargesOrAmount.AddFormattedText("CHARGES", TextFormat.Bold);
            }
            rowHeader.Cells[3].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[3].VerticalAlignment = VerticalAlignment.Center;
            rowHeader.Cells[3].MergeRight = 1;

            //                                              //Delivery column configuration.
            Paragraph parPaymentOrBalance = rowHeader.Cells[5].AddParagraph();
            if (
                (this.strType == "Forward")
                )
            {
                parPaymentOrBalance.AddFormattedText("BALANCE", TextFormat.Bold);
            }
            else
            {
                parPaymentOrBalance.AddFormattedText("PAYMENT", TextFormat.Bold);
            }
            rowHeader.Cells[5].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[5].VerticalAlignment = VerticalAlignment.Center;
            rowHeader.Cells[5].MergeRight = 1;

            this.subSetStatementData(tabStatement);
            this.subSetTotalRow(tabStatement);

            TextFrame textFrame = section.AddTextFrame();
            textFrame.Height = "1.0cm";
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subSetStatementData(
            Table tabStatement
            )
        {
            Row rowStatement = null;

            if (
                this.strType == "Forward"
                )
            {
                rowStatement = tabStatement.AddRow();
                rowStatement.Format.Font.Size = 8;
                rowStatement.Format.Alignment = ParagraphAlignment.Left;

                rowStatement.Cells[0].AddParagraph(stapdfmod.strDate ?? "-");
                rowStatement.Cells[1].AddParagraph("Balance Forward");
                rowStatement.Cells[1].Format.Alignment = ParagraphAlignment.Right;
                rowStatement.Cells[1].MergeRight = 1;

                rowStatement.Cells[5].AddParagraph("$");
                rowStatement.Cells[6].AddParagraph(String.Format("{0:#,##0.00}", 
                    stapdfmod.numnTotalAmount.GetValueOrDefault()));
                rowStatement.Cells[6].Format.Alignment = ParagraphAlignment.Right;
            }

            foreach (StatementRowPdfModel row in stapdfmod.arrrow)
            {
                rowStatement = tabStatement.AddRow();
                rowStatement.Format.Font.Size = 8;
                rowStatement.Format.Alignment = ParagraphAlignment.Left;

                rowStatement.Cells[0].AddParagraph(row.strDate ?? "-");
                rowStatement.Cells[1].AddParagraph(row.strType ?? "-");
                rowStatement.Cells[2].AddParagraph(row.strNumber ?? "-");
                rowStatement.Cells[2].Format.Alignment = ParagraphAlignment.Right;

                rowStatement.Cells[3].AddParagraph("$");
                if (
                    this.strType == "Forward"
                    )
                {
                    rowStatement.Cells[4].AddParagraph(row.numnAmount == null ? "" : String.Format("{0:#,##0.00}", 
                        row.numnAmount.GetValueOrDefault()));
                }
                else
                {
                    rowStatement.Cells[4].AddParagraph(row.numnCharge == null ? "" : String.Format("{0:#,##0.00}", 
                        row.numnCharge.GetValueOrDefault()));
                }
                rowStatement.Cells[4].Format.Alignment = ParagraphAlignment.Right;

                rowStatement.Cells[5].AddParagraph("$");
                if (
                    this.strType == "Forward"
                    )
                {
                    rowStatement.Cells[6].AddParagraph(row.numnBalance == null ? "" : String.Format("{0:#,##0.00}", 
                        row.numnBalance.GetValueOrDefault()));
                }
                else
                {
                    rowStatement.Cells[6].AddParagraph(row.numnPayment == null ? "" : String.Format("{0:#,##0.00}", 
                        row.numnPayment.GetValueOrDefault()));
                }
                rowStatement.Cells[6].Format.Alignment = ParagraphAlignment.Right;
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subSetTotalRow(
            Table tabStatement
            )
        {
            Row rowStatement = null;
            rowStatement = tabStatement.AddRow();
            rowStatement.Format.Font.Size = 10;
            rowStatement.Format.Font.Bold = true;
            rowStatement.Format.Alignment = ParagraphAlignment.Right;
            rowStatement.Format.Borders.Top.Color = Color.FromRgb(0, 0, 0);
            rowStatement.Format.Borders.Top.Width = 1;

            if (
                this.strType != "Forward"
                )
            {
                rowStatement.Cells[3].AddParagraph("$");
                rowStatement.Cells[3].Borders.Top.Visible = false;
                rowStatement.Cells[4].AddParagraph(String.Format("{0:#,##0.00}", 
                    stapdfmod.numnTotalCharge.GetValueOrDefault()));

                rowStatement.Cells[5].AddParagraph("$");
                rowStatement.Cells[5].Borders.Top.Visible = false;
                rowStatement.Cells[6].AddParagraph(String.Format("{0:#,##0.00}", 
                    stapdfmod.numnTotalPayment.GetValueOrDefault()));
            }
            else
            {
                rowStatement.Cells[3].AddParagraph("$");
                rowStatement.Cells[3].Borders.Top.Visible = false;
                rowStatement.Cells[4].AddParagraph(String.Format("{0:#,##0.00}", 
                    stapdfmod.numnTotalAmount.GetValueOrDefault()));
            }
        }


        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subPrintAmountDueTable()
        {
            Table tabStatementDueTable = this.section.AddTable();
            tabStatementDueTable.Style = "Table";
            tabStatementDueTable.Borders.Color = Color.FromRgb(255, 255, 255);
            tabStatementDueTable.Borders.Width = 3;

            //                                              //Create the table columns.
            Column colTablecols = tabStatementDueTable.AddColumn("3.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabStatementDueTable.AddColumn("3.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabStatementDueTable.AddColumn("3.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;

            colTablecols = tabStatementDueTable.AddColumn("3.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;

            colTablecols = tabStatementDueTable.AddColumn("3.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;

            colTablecols = tabStatementDueTable.AddColumn("4.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;

            //                                              //Add a new row for the table headers.
            Row rowHeader = tabStatementDueTable.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(79, 154, 202);
            rowHeader.Format.Font.Size = 10;
            rowHeader.Shading.Color = Color.FromRgb(220, 233, 241);

            //                                              //Order Information column configuration.
            Paragraph parCurrent = rowHeader.Cells[0].AddParagraph();
            parCurrent.AddFormattedText("Current Due", TextFormat.Bold);
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[0].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Job specs column configuration.
            Paragraph par30Days = rowHeader.Cells[1].AddParagraph();
            par30Days.AddFormattedText("1-30 Days Past Due", TextFormat.Bold);
            rowHeader.Cells[1].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[1].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Contact column configuration.
            Paragraph par60Days = rowHeader.Cells[2].AddParagraph();
            par60Days.AddFormattedText("31-60 Days Past Due", TextFormat.Bold);
            rowHeader.Cells[2].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[2].VerticalAlignment = VerticalAlignment.Center;
            
            Paragraph par90Days = rowHeader.Cells[3].AddParagraph();
            par90Days.AddFormattedText("61-90 Days Past Due", TextFormat.Bold);
            rowHeader.Cells[3].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[3].VerticalAlignment = VerticalAlignment.Center;
            
            Paragraph parMoreThan90Days = rowHeader.Cells[4].AddParagraph();
            parMoreThan90Days.AddFormattedText("90+ Days Past Due", TextFormat.Bold);
            rowHeader.Cells[4].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[4].VerticalAlignment = VerticalAlignment.Center;
            
            Paragraph parAmountDue = rowHeader.Cells[5].AddParagraph();
            parAmountDue.AddFormattedText("Amount Due", TextFormat.Bold);
            rowHeader.Cells[5].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[5].VerticalAlignment = VerticalAlignment.Center;

            Row rowStatement = tabStatementDueTable.AddRow();
            rowStatement.Format.Font.Size = 8;
            rowStatement.Format.Alignment = ParagraphAlignment.Right;

            rowStatement.Cells[0].AddParagraph("$ " + this.stapdfmod.numCurrentDue.ToString("n2"));
            rowStatement.Cells[1].AddParagraph("$ " + this.stapdfmod.num30DaysDue.ToString("n2"));
            rowStatement.Cells[2].AddParagraph("$ " + this.stapdfmod.num60DaysDue.ToString("n2"));
            rowStatement.Cells[3].AddParagraph("$ " + this.stapdfmod.num90DaysDue.ToString("n2"));
            rowStatement.Cells[4].AddParagraph("$ " + this.stapdfmod.numMore90DaysDue.ToString("n2"));
            rowStatement.Cells[5].AddParagraph("$ " + this.stapdfmod.numAmountDue.ToString("n2"));
        }



        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
