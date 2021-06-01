/*RP. Task Ticket*/
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
//                                                          //DATE: November 11, 2020.

namespace Odyssey2Frontend.Invoice
{
    public class InvpdfInvoicePdf
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES

        private Document document = null;
        private Section section = null;
        private InvoiceModel invmod = null;

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //--------------------------------------------------------------------------------------------------------------
        public InvpdfInvoicePdf(
            InvoiceModel invmod_I
            )
        {
            this.invmod = invmod_I;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        public byte[] arrbyteGenerateInvoice()
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
            this.subCreateInvoice();

            //                                              //Render the document.
            PdfDocumentRenderer pdfRenderer = new PdfDocumentRenderer(false);
            pdfRenderer.Document = this.document;
            pdfRenderer.RenderDocument();

            //                                              //Parse the document to array of bytes.
            byte[] arrByte = null;
            using (MemoryStream memoryStream = new MemoryStream())
            {
                pdfRenderer.Save(memoryStream, true);
                arrByte = memoryStream.ToArray();
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
        private void subCreateInvoice()
        {
            this.section = this.document.AddSection();
            this.section.PageSetup.PageFormat = PageFormat.Letter;

            this.subCreateHeader();

            this.subCreateTermsTable();
            this.subCreateCommentsTable();
            this.subCreatConceptTable();
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateHeader()
        {
            Paragraph paragraph = null;
            String[] darrstrAddressLines = null;

            //                                              //Left data
            //                                              //Title ship config.
            TextFrame textShipFrame = section.AddTextFrame();
            textShipFrame.Height = "15.0cm";
            textShipFrame.Width = "6.0cm";
            textShipFrame.Left = ShapePosition.Left;
            textShipFrame.RelativeHorizontal = RelativeHorizontal.Margin;
            textShipFrame.Top = "1.0cm";
            textShipFrame.RelativeVertical = RelativeVertical.Page;

            if (
                !String.IsNullOrEmpty(invmod.strLogoUrl)
                )
            {
                Image imageLogo = textShipFrame.AddImage("base64:" + Convert.ToBase64String(arrbyteGetLogoImage()));
                imageLogo.Height = Unit.FromCentimeter(1.5);

                paragraph = textShipFrame.AddParagraph();
                paragraph.AddFormattedText("\n");
            }

            //                                              //Title shipp info.
            paragraph = textShipFrame.AddParagraph();
            paragraph.AddFormattedText("Shipped To: \n", TextFormat.Bold);

            //                                              //Full Name.
            if (
                !String.IsNullOrEmpty(invmod.strShippedToFirstName) || 
                !String.IsNullOrEmpty(invmod.strShippedToLastName)
                )
            {
                String strFullName = (invmod.strShippedToFirstName != null) ? invmod.strShippedToFirstName + " " : "";
                strFullName = strFullName + ((invmod.strShippedToLastName != null) ? invmod.strShippedToLastName : "");
                if (
                    strFullName != ""
                    )
                {
                    paragraph.AddFormattedText(strFullName + "\n");
                }
            }

            //                                              //Address line 1.
            if (
                !String.IsNullOrEmpty(invmod.strShippedToLine1) 
                )
            {
                paragraph.AddFormattedText(invmod.strShippedToLine1 + "\n");
            }

            //                                              //Address line 2.
            if (
                !String.IsNullOrEmpty(invmod.strShippedToLine2)
                )
            {
                paragraph.AddFormattedText(invmod.strShippedToLine2 + "\n");
            }

            //                                              //City, State Zipcode.
            if (
                !String.IsNullOrEmpty(invmod.strShippedToCity) ||
                !String.IsNullOrEmpty(invmod.strShippedToState) ||
                !String.IsNullOrEmpty(invmod.strShippedToZip)
                )
            {
                String strFullLine = (invmod.strShippedToCity != null) ? invmod.strShippedToCity + ", " : "";
                strFullLine = strFullLine + ((invmod.strShippedToState != null) ? invmod.strShippedToState + " " : "");
                strFullLine = strFullLine + ((invmod.strShippedToZip != null) ? invmod.strShippedToZip : "");
                if (
                    strFullLine != ""
                    )
                {
                    paragraph.AddFormattedText(strFullLine + "\n");
                }
            }

            //                                              //Country.
            if (
                !String.IsNullOrEmpty(invmod.strShippedToCountry)
                )
            {
                paragraph.AddFormattedText(invmod.strShippedToCountry + "\n");
            }

            paragraph.AddFormattedText("\n", TextFormat.Bold);
            paragraph.AddFormattedText("Billed To: \n", TextFormat.Bold);
            if (
                !String.IsNullOrEmpty(invmod.strBilledTo)
                )
            {
                darrstrAddressLines = invmod.strBilledTo.Split("\n");
                foreach (String strAddressLine in darrstrAddressLines)
                {
                    paragraph.AddFormattedText(strAddressLine + "\n");
                }
            }
            else
            {
                paragraph.AddFormattedText("\n");
            }

            paragraph.Format.Alignment = ParagraphAlignment.Left;
            paragraph.Format.Font.Size = 8;

            //                                              //Title section config.
            textShipFrame = section.AddTextFrame();
            textShipFrame.Height = "15.0cm";
            textShipFrame.Width = "6.0cm";
            textShipFrame.Left = ShapePosition.Right;
            textShipFrame.RelativeHorizontal = RelativeHorizontal.Margin;
            textShipFrame.Top = "1.0cm";
            textShipFrame.RelativeVertical = RelativeVertical.Page;

            //                                              //Title section info.
            paragraph = textShipFrame.AddParagraph();
            int intInvoiceNumber = (invmod.intnInvoiceNumber == null ?
                invmod.intOrderId : invmod.intnInvoiceNumber.Value);
            paragraph.AddFormattedText("INVOICE # " + intInvoiceNumber + "\n", TextFormat.Bold);
            paragraph.AddFormattedText("Order Number # " + invmod.intnOrderNumber + "\n");
            paragraph.AddFormattedText("Order Date: " + invmod.strOrderDate.Split("T")[0] + "\n");

            int intNumberOfJobs = invmod.darrinvjobinfojson.Where(job => job.intnJobId != null).Count();
            paragraph.AddFormattedText("This order contains " + intNumberOfJobs + " job" +
                (intNumberOfJobs.ToString() != "1" ? "s" : "") + " \n\n");

            paragraph.AddFormattedText("Make Check Payable To:\n", TextFormat.Bold);
            if (
                !String.IsNullOrEmpty(invmod.strPayableTo)
                )
            {
                darrstrAddressLines = invmod.strPayableTo.Split("\n");
                foreach (String strAddressLine in darrstrAddressLines)
                {
                    paragraph.AddFormattedText(strAddressLine + "\n");
                }
            }
            else
            {
                paragraph.AddFormattedText("\n");
            }

            paragraph.AddFormattedText("Please reference your invoice number with payment", TextFormat.Italic);

            paragraph.Format.Alignment = ParagraphAlignment.Left;
            paragraph.Format.Font.Size = 8;

            //                                              //Space between the titles and de table.
            textShipFrame = section.AddTextFrame();
            textShipFrame.Height = "6.0cm";
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private byte[] arrbyteGetLogoImage()
        {
            byte[] arrbyteLogoImage = null;

            using (WebClient webClient = new WebClient())
            {
                arrbyteLogoImage = webClient.DownloadData("http://" + invmod.strLogoUrl);
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
            tabTermsInfo.Borders.Width = 1;

            //                                              //Create the table columns.
            Column colTablecols = tabTermsInfo.AddColumn("6.3cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabTermsInfo.AddColumn("6.3cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabTermsInfo.AddColumn("6.4cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;


            //                                              //Add a new row for the table headers.
            Row rowHeader = tabTermsInfo.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(0, 0, 0);
            rowHeader.Format.Font.Size = 8;
            rowHeader.Shading.Color = Color.FromRgb(186, 186, 186);

            //                                              //Order Information column configuration.
            Paragraph parOrderTermsInformation = rowHeader.Cells[0].AddParagraph();
            parOrderTermsInformation.AddFormattedText("Terms", TextFormat.Bold);
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[0].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Job specs column configuration.
            Paragraph parShippingMethod = rowHeader.Cells[1].AddParagraph();
            parShippingMethod.AddFormattedText("Shipping Method", TextFormat.Bold);
            rowHeader.Cells[1].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[1].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Contact column configuration.
            Paragraph parPONumber = rowHeader.Cells[2].AddParagraph();
            parPONumber.AddFormattedText("P.O. Number", TextFormat.Bold);
            rowHeader.Cells[2].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[2].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Each function add information to their respective column.
            Row rowTerms = tabTermsInfo.AddRow();
            rowTerms.Format.Font.Size = 8;
            rowTerms.Format.Alignment = ParagraphAlignment.Left;

            rowTerms.Cells[0].AddParagraph(invmod.strTerms ?? "");
            rowTerms.Cells[1].AddParagraph(invmod.strShippingMethod ?? "");
            rowTerms.Cells[2].AddParagraph(invmod.strPO ?? "");

            TextFrame spaceBetweenTextFrame = section.AddTextFrame();
            spaceBetweenTextFrame.Height = "0.5cm";
        }

        private void subCreateCommentsTable()
        {
            //                                              //Terms information table config.
            Table tabTermsInfo = this.section.AddTable();
            tabTermsInfo.Style = "Table";
            tabTermsInfo.Borders.Color = Color.FromRgb(0, 0, 0);
            tabTermsInfo.Borders.Width = 1;

            //                                              //Create the table columns.
            Column colTablecols = tabTermsInfo.AddColumn("19.0cm");

            //                                              //Add a new row for the table headers.
            Row rowHeader = tabTermsInfo.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(0, 0, 0);
            rowHeader.Format.Font.Size = 8;
            rowHeader.Shading.Color = Color.FromRgb(186, 186, 186);

            //                                              //Order Information column configuration.
            Paragraph parOrderTermsInformation = rowHeader.Cells[0].AddParagraph();
            parOrderTermsInformation.AddFormattedText("Additional Comments or Instructions", TextFormat.Bold);
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[0].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Each function add information to their respective column.
            Row rowTerms = tabTermsInfo.AddRow();
            rowTerms.Format.Font.Size = 8;
            rowTerms.Format.Alignment = ParagraphAlignment.Left;

            rowTerms.Cells[0].AddParagraph(invmod.strComments ?? "");

            TextFrame spaceBetweenTextFrame = section.AddTextFrame();
            spaceBetweenTextFrame.Height = "0.5cm";
        }

        private void subCreatConceptTable()
        {
            //                                              //Terms information table config.
            Table tabJobsInfo = this.section.AddTable();
            tabJobsInfo.Style = "Table";
            tabJobsInfo.Borders.Color = Color.FromRgb(0, 0, 0);
            tabJobsInfo.Borders.Width = 1;

            //                                              //Create the table columns.
            Column colTablecols = tabJobsInfo.AddColumn("3.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabJobsInfo.AddColumn("10.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabJobsInfo.AddColumn("3.0cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabJobsInfo.AddColumn("0.5cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;
            
            colTablecols = tabJobsInfo.AddColumn("2.5cm");

            //                                              //Add a new row for the table headers.
            Row rowHeader = tabJobsInfo.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(0, 0, 0);
            rowHeader.Format.Font.Size = 8;
            rowHeader.Shading.Color = Color.FromRgb(186, 186, 186);

            //                                              //Order Information column configuration.
            Paragraph parJobNumber = rowHeader.Cells[0].AddParagraph();
            parJobNumber.AddFormattedText("Job Number", TextFormat.Bold);
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[0].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Job specs column configuration.
            Paragraph parDescription = rowHeader.Cells[1].AddParagraph();
            parDescription.AddFormattedText("Description", TextFormat.Bold);
            rowHeader.Cells[1].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[1].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Contact column configuration.
            Paragraph parQuantity = rowHeader.Cells[2].AddParagraph();
            parQuantity.AddFormattedText("Quantity", TextFormat.Bold);
            rowHeader.Cells[2].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[2].VerticalAlignment = VerticalAlignment.Center;

            Paragraph parPrice = rowHeader.Cells[3].AddParagraph();
            parPrice.AddFormattedText("Price", TextFormat.Bold);
            rowHeader.Cells[3].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[3].VerticalAlignment = VerticalAlignment.Center;
            rowHeader.Cells[3].MergeRight = 1;

            Row rowJobs = null;
            //                                              //Add every job on the order.
            foreach (JobDataModel jobData in invmod.darrinvjobinfojson)
            {
                rowJobs = tabJobsInfo.AddRow();
                rowJobs.Format.Font.Size = 8;
                rowJobs.Format.Alignment = ParagraphAlignment.Left;

                rowJobs.Cells[0].AddParagraph(jobData.strJobNumber ?? "-");
                rowJobs.Cells[1].AddParagraph(jobData.strName ?? "");
                rowJobs.Cells[2].AddParagraph(jobData.intQuantity.ToString());
                rowJobs.Cells[3].AddParagraph("$");
                rowJobs.Cells[3].Borders.Right.Visible = false;
                rowJobs.Cells[4].AddParagraph(jobData.numPrice.ToString("n2"));
                rowJobs.Cells[4].Format.Alignment = ParagraphAlignment.Right;
            }

            rowJobs = tabJobsInfo.AddRow();
            rowJobs.Format.Font.Size = 8;
            rowJobs.Format.Alignment = ParagraphAlignment.Left;

            Paragraph parSubTotal = rowJobs.Cells[2].AddParagraph();
            parSubTotal.AddFormattedText("Subtotal", TextFormat.Bold);
            rowJobs.Cells[3].AddParagraph("$");
            rowJobs.Cells[3].Borders.Right.Visible = false;
            rowJobs.Cells[4].AddParagraph(invmod.numSubtotalTotal.ToString("N2"));
            rowJobs.Cells[4].Format.Alignment = ParagraphAlignment.Right;

            rowJobs = tabJobsInfo.AddRow();
            rowJobs.Format.Font.Size = 8;
            rowJobs.Format.Alignment = ParagraphAlignment.Left;

            Paragraph parTotalTaxes = rowJobs.Cells[2].AddParagraph();
            parTotalTaxes.AddFormattedText("Sales Tax (" + invmod.numTaxPercentage + " %) ", TextFormat.Bold);
            rowJobs.Cells[3].AddParagraph("$");
            rowJobs.Cells[3].Borders.Right.Visible = false;
            rowJobs.Cells[4].AddParagraph(invmod.numTaxes.ToString("N2"));
            rowJobs.Cells[4].Format.Alignment = ParagraphAlignment.Right;

            rowJobs = tabJobsInfo.AddRow();
            rowJobs.Format.Font.Size = 8;
            rowJobs.Format.Alignment = ParagraphAlignment.Left;

            Paragraph parTotal = rowJobs.Cells[2].AddParagraph();
            parTotal.AddFormattedText("Total", TextFormat.Bold);
            rowJobs.Cells[3].AddParagraph("$");
            rowJobs.Cells[3].Borders.Right.Visible = false;
            rowJobs.Cells[4].AddParagraph(invmod.numTotal.ToString("N2"));
            rowJobs.Cells[4].Format.Alignment = ParagraphAlignment.Right;
        }

        //--------------------------------------------------------------------------------------------------------------
    }
}
/*END-TASK*/
