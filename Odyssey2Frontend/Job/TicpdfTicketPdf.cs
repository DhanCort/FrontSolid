/*RP. Task Ticket*/
using System;
using System.Collections.Generic;
using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Tables;
using MigraDoc.DocumentObjectModel.Shapes;
using MigraDoc.Rendering;
using System.IO;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: September 11, 2020.

namespace Odyssey2Frontend.Job
{
    public class TicpdfTicketPdf
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES

        private Document document = null;
        private Section section = null;
        private TicketModel ticmod = null;

        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //-------------------------------------------------------------------------------------------------------------
        public TicpdfTicketPdf(
            TicketModel ticmod_I
            )
        {
            this.ticmod = ticmod_I;
        }
        
        //-------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //-------------------------------------------------------------------------------------------------------------
        
        //-------------------------------------------------------------------------------------------------------------
        public byte[] arrbyteGenerateTicket()
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
            this.subCreateTicket();

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


        //-------------------------------------------------------------------------------------------------------------
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
        private void subCreateTicket()
        {
            this.section = this.document.AddSection();
            this.section.PageSetup.PageFormat = PageFormat.Letter;

            this.subCreateHeader();

            this.subCreateInformativeJobTable();

            this.subCreateEstimateTable();

            this.subCreateOrderNotesTable();

            this.subCreateOdysseyNotesTable();

            this.subCreateFooter();
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateHeader()
        {
            Paragraph paragraph = null;

            //                                              //Title section config.
            TextFrame textFrameTitle = section.AddTextFrame();
            textFrameTitle.Height = "8.0cm";
            textFrameTitle.Width = "14.0cm";
            textFrameTitle.Left = ShapePosition.Left;
            textFrameTitle.RelativeHorizontal = RelativeHorizontal.Margin;
            textFrameTitle.Top = "1.0cm";
            textFrameTitle.RelativeVertical = RelativeVertical.Page;
            
            //                                              //Title section info.
            paragraph = textFrameTitle.AddParagraph(ticmod.strCompany + " • " + ticmod.strCustomerName + 
                "\n" +  ticmod.strJobTicket + " - " + ticmod.strProductName + 
                "\n" + ticmod.intProductKey.ToString());
            paragraph.Format.Alignment = ParagraphAlignment.Left;
            paragraph.Format.Font.Bold = true;
            paragraph.Format.Font.Size = 11;
            
            //                                              //Title section config.
            textFrameTitle = section.AddTextFrame();
            textFrameTitle.Height = "8.0cm";
            textFrameTitle.Width = "4.8cm";
            textFrameTitle.Left = ShapePosition.Right;
            textFrameTitle.RelativeHorizontal = RelativeHorizontal.Margin;
            textFrameTitle.Top = "1.0cm";
            textFrameTitle.RelativeVertical = RelativeVertical.Page;

            //                                              //Title section info.
            paragraph = textFrameTitle.AddParagraph("Job Number: " + (ticmod.strJobNumber ?? "-") + "\n" +
                "Status: " + ticmod.strJobStatus);
            paragraph.Format.Alignment = ParagraphAlignment.Right;
            paragraph.Format.Font.Bold = true;
            paragraph.Format.Font.Size = 11;

            //                                              //Space between the titles and de table.
            textFrameTitle = section.AddTextFrame();
            textFrameTitle.Height = "2.0cm";
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateInformativeJobTable()
        {
            //                                              //Ticket information table config.
            Table tabTicketInfo = this.section.AddTable();
            tabTicketInfo.Style = "Table";
            tabTicketInfo.Borders.Color = Color.FromRgb(255, 255, 255);
            tabTicketInfo.Borders.Width = 3;

            //                                              //Create the table columns.
            Column colTablecols = tabTicketInfo.AddColumn("4.7cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Center;

            colTablecols = tabTicketInfo.AddColumn("4.7cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;

            colTablecols = tabTicketInfo.AddColumn("4.7cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;
            
            colTablecols = tabTicketInfo.AddColumn("4.7cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;

            //                                              //Add a new row for the table headers.
            Row rowHeader = tabTicketInfo.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(255, 255, 255);
            rowHeader.Format.Font.Size = 8;
            rowHeader.Shading.Color = Color.FromRgb(0, 0, 0);

            //                                              //Order Information column configuration.
            Paragraph parOrderInformation = rowHeader.Cells[0].AddParagraph();
            parOrderInformation.AddFormattedText("Order Information", TextFormat.Bold);
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[0].VerticalAlignment = VerticalAlignment.Center;
            
            //                                              //Job specs column configuration.
            Paragraph parJobSpecs = rowHeader.Cells[1].AddParagraph();
            parJobSpecs.AddFormattedText("Job Specs", TextFormat.Bold);
            rowHeader.Cells[1].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[1].VerticalAlignment = VerticalAlignment.Center;
            
            //                                              //Contact column configuration.
            Paragraph parContact = rowHeader.Cells[2].AddParagraph();
            parContact.AddFormattedText("Contact", TextFormat.Bold);
            rowHeader.Cells[2].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[2].VerticalAlignment = VerticalAlignment.Center;
            
            //                                              //Delivery column configuration.
            Paragraph parDelivery = rowHeader.Cells[3].AddParagraph();
            parDelivery.AddFormattedText("Delivery / Ship / Pickup", TextFormat.Bold);
            rowHeader.Cells[3].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[3].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Each function add information to their respective column.
            Row rowInfo = tabTicketInfo.AddRow();

            //                                              //Each function add information to their respective column.
            this.subAddOrderInformation(rowInfo);
            this.subAddJobSpecs(rowInfo);
            this.subAddContact(rowInfo);
            this.subAddDelivery(rowInfo);
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddOrderInformation(
            Row rowInfo
            )
        {
            rowInfo.Cells[0].Format.Font.Bold = false;
            rowInfo.Cells[0].Format.Font.Size = 8;
            rowInfo.Cells[0].Format.Alignment = ParagraphAlignment.Left;

            //                                              //Create a new Paragraph instance.
            Paragraph paragraphOrderInformation = null;

            //                                              //Set PO # data.
            paragraphOrderInformation = rowInfo.Cells[0].AddParagraph();
            paragraphOrderInformation.AddFormattedText("Workflow: " + (ticmod.strWorkflowName ?? ""));
            paragraphOrderInformation.Format.Font.Color = Color.FromRgb(250, 80, 80);
            paragraphOrderInformation.Format.Font.Size = 9;

            //                                              //Customer start date and time.
            paragraphOrderInformation = rowInfo.Cells[0].AddParagraph();
            paragraphOrderInformation.AddFormattedText("Start Date: ", TextFormat.Bold);
            paragraphOrderInformation.AddFormattedText(ticmod.strStartDate + " " + ticmod.strStartTime);
            
            //                                              //Customer end date and time.
            paragraphOrderInformation = rowInfo.Cells[0].AddParagraph();
            paragraphOrderInformation.AddFormattedText("End Date: ", TextFormat.Bold);
            paragraphOrderInformation.AddFormattedText(ticmod.strEndDate + " " + ticmod.strEndTime);
            
            //                                              //Customer Rep value.
            paragraphOrderInformation = rowInfo.Cells[0].AddParagraph();
            paragraphOrderInformation.AddFormattedText("Customer Rep: ", TextFormat.Bold);
            paragraphOrderInformation.AddFormattedText(ticmod.strCustomerRep ?? "");

            //                                              //Sales Rep value.
            paragraphOrderInformation = rowInfo.Cells[0].AddParagraph();
            paragraphOrderInformation.AddFormattedText("Sales Rep: ", TextFormat.Bold);
            paragraphOrderInformation.AddFormattedText(ticmod.strSalesRep ?? "");
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddJobSpecs(
            Row rowInfo
            )
        {
            rowInfo.Cells[1].Format.Font.Bold = false;
            rowInfo.Cells[1].Format.Font.Size = 8;
            rowInfo.Cells[1].Format.Alignment = ParagraphAlignment.Left;

            //                                              //Create a new Paragraph instance.
            Paragraph paragraphJobSpec = null;

            //                                              //Set each order form value of the job.
            paragraphJobSpec = rowInfo.Cells[1].AddParagraph();
            paragraphJobSpec.AddFormattedText("Quantity: " + ticmod.intnQuantity.Value);
            paragraphJobSpec.Format.Font.Color = Color.FromRgb(250, 80, 80);
            paragraphJobSpec.Format.Font.Size = 9;

            //                                              //Set Data on list.
            foreach (EstimateOrderFormAttributesModel item in ticmod.arrattr)
            {
                //                                          //Set each order form value of the job.
                paragraphJobSpec = rowInfo.Cells[1].AddParagraph();
                paragraphJobSpec.AddFormattedText(item.strAttributeName + ": ", TextFormat.Bold);
                paragraphJobSpec.AddFormattedText(item.strValue ?? "");
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddContact(
            Row rowInfo
            )
        {
            rowInfo.Cells[2].Format.Font.Bold = false;
            rowInfo.Cells[2].Format.Font.Size = 8;
            rowInfo.Cells[2].Format.Alignment = ParagraphAlignment.Left;

            //                                              //Create a new Paragraph instance.
            Paragraph paragraphOrderInformation = null;

            //                                              //Set Customer name.
            paragraphOrderInformation = rowInfo.Cells[2].AddParagraph();
            paragraphOrderInformation.AddFormattedText(ticmod.strCustomerName ?? "");
            paragraphOrderInformation.Format.Font.Color = Color.FromRgb(250, 80, 80);
            paragraphOrderInformation.Format.Font.Size = 9;

            //                                              //Set customer email.
            paragraphOrderInformation = rowInfo.Cells[2].AddParagraph();
            paragraphOrderInformation.AddFormattedText(ticmod.strEmail ?? "");

            //                                              //Set customer phone number.
            paragraphOrderInformation = rowInfo.Cells[2].AddParagraph();
            paragraphOrderInformation.AddFormattedText(ticmod.strPhone ?? "");

            //                                              //Set customer company and branch.
            String strCompanyAndBranch = ticmod.strBranch != "-" ? " • " + ticmod.strBranch : null;
            if (
                ticmod.strCompany != "-" && 
                ticmod.strBranch != "-"
                )
            {
                strCompanyAndBranch = ticmod.strCompany + " • " + ticmod.strBranch;
            }
            else
            {
                strCompanyAndBranch = (ticmod.strCompany == "-" ? "" : ticmod.strCompany) + 
                    (ticmod.strBranch == "-" ? "" : ticmod.strBranch);
            }
            paragraphOrderInformation = rowInfo.Cells[2].AddParagraph();
            paragraphOrderInformation.AddFormattedText(strCompanyAndBranch, TextFormat.Bold);

            //                                              //Set customer customer address.
            if (
                !String.IsNullOrEmpty(ticmod.strAddressLine1) &&
                ticmod.strAddressLine1 != "-"
                )
            {
                paragraphOrderInformation = rowInfo.Cells[2].AddParagraph();
                paragraphOrderInformation.AddFormattedText("Address Line 1: ", TextFormat.Bold);
                paragraphOrderInformation.AddFormattedText(ticmod.strAddressLine1);
            }

            //                                              //Set customer customer address.
            if (
                !String.IsNullOrEmpty(ticmod.strAddressLine2) &&
                ticmod.strAddressLine2 != "-"
                )
            {
                paragraphOrderInformation = rowInfo.Cells[2].AddParagraph();
                paragraphOrderInformation.AddFormattedText("Address Line 2: ", TextFormat.Bold);
                paragraphOrderInformation.AddFormattedText(ticmod.strAddressLine2);
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddDelivery(
            Row rowInfo
            )
        {
            rowInfo.Cells[3].Format.Font.Bold = false;
            rowInfo.Cells[3].Format.Font.Size = 8;
            rowInfo.Cells[3].Format.Alignment = ParagraphAlignment.Left;

            //                                              //Create a new Paragraph instance.
            Paragraph paragraphOrderInformation = null;

            //                                              //Due title.
            paragraphOrderInformation = rowInfo.Cells[3].AddParagraph();
            paragraphOrderInformation.AddFormattedText("Due");
            paragraphOrderInformation.Format.Font.Color = Color.FromRgb(250, 80, 80);
            paragraphOrderInformation.Format.Font.Size = 9;

            //                                              //Set customer customer address.
            paragraphOrderInformation = rowInfo.Cells[3].AddParagraph();
            paragraphOrderInformation.AddFormattedText("Shipping: ", TextFormat.Bold);
            paragraphOrderInformation.AddFormattedText(ticmod.strDelivery ?? "");
            
            //                                              //Set delivery date.
            paragraphOrderInformation = rowInfo.Cells[3].AddParagraph();
            paragraphOrderInformation.AddFormattedText("Due Date: ", TextFormat.Bold);
            paragraphOrderInformation.AddFormattedText(ticmod.strDueDate + " " + ticmod.strDueTime);
            
            //                                              //Set customer customer address.
            paragraphOrderInformation = rowInfo.Cells[3].AddParagraph();
            paragraphOrderInformation.AddFormattedText("Delivery Date: ", TextFormat.Bold);
            paragraphOrderInformation.AddFormattedText(ticmod.strDeliveryDate + " " + ticmod.strDeliveryTime);
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateEstimateTable()
        {
            this.section.AddParagraph();
            Table tabEstimate = this.section.AddTable();
            tabEstimate.Style = "Table";
            tabEstimate.Borders.Color = Color.FromRgb(0, 0, 0);
            tabEstimate.Borders.Width = 1;

            //                                              //Create the table's cells.
            Column column = tabEstimate.AddColumn("9.4cm");
            column.Format.Alignment = ParagraphAlignment.Center;

            column = tabEstimate.AddColumn("4.7cm");
            column.Format.Alignment = ParagraphAlignment.Right;

            column = tabEstimate.AddColumn("0.5cm");
            column.Format.Alignment = ParagraphAlignment.Right;
            column.Borders.Right.Visible = false;

            column = tabEstimate.AddColumn("4.2cm");
            column.Format.Alignment = ParagraphAlignment.Right;

            Row rowHeader = tabEstimate.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(255, 255, 255);
            rowHeader.Format.Font.Size = 8;
            rowHeader.Shading.Color = Color.FromRgb(0, 0, 0);

            //                                              //Concept colum and config.
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[0].VerticalAlignment = VerticalAlignment.Center;
            Paragraph paragraphConcept = rowHeader.Cells[0].AddParagraph();
            paragraphConcept.AddFormattedText("Concept", TextFormat.Bold);

            //                                              //Quantity colum and config.
            rowHeader.Cells[1].Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Cells[1].VerticalAlignment = VerticalAlignment.Center;
            Paragraph paragraphQuantity = rowHeader.Cells[1].AddParagraph();
            paragraphQuantity.AddFormattedText("Quantity", TextFormat.Bold);

            //                                              //Cost colum and config.
            rowHeader.Cells[2].Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Cells[2].VerticalAlignment = VerticalAlignment.Center;
            rowHeader.Cells[2].MergeRight = 1;
            Paragraph paragraphCost = rowHeader.Cells[2].AddParagraph();
            paragraphCost.AddFormattedText("Cost", TextFormat.Bold);

            //                                              //Function to add the product name.
            subAddProductRow(tabEstimate, ticmod);

            //                                              //Function to add the calculation' rows.
            subAddCalculationRows(tabEstimate, "BulletLevel2", ticmod.arrcal);

            //                                              //Function to add the process' rows.
            subAddProcessRows(tabEstimate, ticmod);

            //                                              //Function to add the total' rows.
            subAddTotalRows(tabEstimate, ticmod);
        }

        private void subAddProductRow(
            Table tabEstimate, 
            TicketModel ticmod)
        {
            //                                              //Add product name on concept column.
            Row row = tabEstimate.AddRow();
            row.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            row.Cells[0].Format.Font.Size = 8;
            row.Cells[0].VerticalAlignment = VerticalAlignment.Center;
            Paragraph paragraphProduct = row.Cells[0].AddParagraph();
            paragraphProduct.AddFormattedText("Product: ", TextFormat.Bold);
            paragraphProduct.AddFormattedText(ticmod.strProductName, TextFormat.NotBold);
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddCalculationRows(
            Table tabEstimate, 
            String strBulletLevel, 
            List<EstimateCalculationModel> darrrcal)
        {
            //                                              //Add calculations and their costs.
            foreach (var item in darrrcal)
            {
                Row row = tabEstimate.AddRow();
                Paragraph paragraphCalculationDescription = row.Cells[0].AddParagraph(item.strDescription);
                paragraphCalculationDescription.Style = strBulletLevel;
                paragraphCalculationDescription.Format.Font.Size = 8;
                row.Cells[2].AddParagraph("$");
                row.Cells[3].AddParagraph(item.numCost.ToString("n2"));
                row.Cells[3].Format.Alignment = ParagraphAlignment.Right;
                row.Cells[3].Format.Font.Size = 8;
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddProcessRows(
            Table tabEstimate,
            TicketModel estmod)
        {
            //                                              //Add processes and their costs.
            Row row = tabEstimate.AddRow();
            Paragraph paragraphProcesses = row.Cells[0].AddParagraph();
            paragraphProcesses.AddFormattedText("Processes:", TextFormat.Bold);
            paragraphProcesses.Style = "BulletLevel2";
            paragraphProcesses.Format.Font.Size = 8;

            foreach (var item in estmod.arrpro)
            {
                row = tabEstimate.AddRow();
                Paragraph paragraphProcessDescription = row.Cells[0].AddParagraph(item.strName);
                paragraphProcessDescription.Style = "BulletLevel3";
                paragraphProcessDescription.Format.Font.Size = 8;

                subAddCalculationRows(tabEstimate, "BulletLevel4", item.arrcal);
                subAddResourceRows(tabEstimate, item.arrres);
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddResourceRows(
            Table tabEstimate, 
            List<TicketResourcesModel> darrres)
        {
            //                                              //Add Resources and their costs.
            Row row = tabEstimate.AddRow();
            Paragraph paragraphProcesses = row.Cells[0].AddParagraph();
            paragraphProcesses.AddFormattedText("Resources:", TextFormat.Bold);
            paragraphProcesses.Style = "BulletLevel4";
            paragraphProcesses.Format.Font.Size = 8;

            foreach (TicketResourcesModel item in darrres)
            {
                row = tabEstimate.AddRow();
                Paragraph paragraphProcessDescription = row.Cells[0].AddParagraph(
                    (item.strName ?? "") + (String.IsNullOrEmpty(item.strEmployee) == true ? 
                    "" : " (" + item.strEmployee + ")"));
                paragraphProcessDescription.Style = "BulletLevel5";
                paragraphProcessDescription.Format.Font.Size = 8;

                row.Cells[1].AddParagraph(item.numQuantity + " " + item.strUnit);
                row.Cells[1].Format.Alignment = ParagraphAlignment.Center;
                row.Cells[1].Format.Font.Size = 8;
                row.Cells[2].AddParagraph("$");
                row.Cells[3].AddParagraph(item.numCost.ToString("n2"));
                row.Cells[3].Format.Alignment = ParagraphAlignment.Right;
                row.Cells[3].Format.Font.Size = 8;
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        public void subAddTotalRows(
            Table tabEstimate, 
            TicketModel ticmod
            )
        {
            //                                              //Total cost row with formart config.
            Row row = tabEstimate.AddRow();
            Paragraph paragraphTotalCost = row.Cells[1].AddParagraph();
            paragraphTotalCost.AddFormattedText("Total Cost:", TextFormat.Bold);
            row.Cells[1].Format.Alignment = ParagraphAlignment.Center;
            row.Cells[1].Format.Font.Size = 8;

            row.Cells[2].AddParagraph("$");
            row.Cells[3].AddParagraph(ticmod.numnJobCost.GetValueOrDefault().ToString("n2"));
            row.Cells[3].Format.Alignment = ParagraphAlignment.Right;
            row.Cells[3].Format.Font.Size = 8;

            //                                              //Total price row with formart config.
            row = tabEstimate.AddRow();
            Paragraph paragraphTotalPrice = row.Cells[1].AddParagraph();
            paragraphTotalPrice.AddFormattedText("Total Price:", TextFormat.Bold);
            row.Cells[1].Format.Alignment = ParagraphAlignment.Center;
            row.Cells[1].Format.Font.Size = 8;

            row.Cells[2].AddParagraph("$");
            row.Cells[3].AddParagraph(ticmod.numnJobPrice.GetValueOrDefault().ToString("n2"));
            row.Cells[3].Format.Alignment = ParagraphAlignment.Right;
            row.Cells[3].Format.Font.Size = 8;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateOrderNotesTable()
        {
            this.section.AddParagraph();
            Table tabEstimate = this.section.AddTable();
            tabEstimate.Style = "Table";
            tabEstimate.Borders.Color = Color.FromRgb(0, 0, 0);
            tabEstimate.Borders.Width = 1;

            //                                              //Create the table's cells.
            Column column = tabEstimate.AddColumn("18.8cm");
            column.Format.Alignment = ParagraphAlignment.Center;

            Row rowHeader = tabEstimate.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(255, 255, 255);
            rowHeader.Format.Font.Size = 8;
            rowHeader.Shading.Color = Color.FromRgb(0, 0, 0);

            //                                              //Concept colum and config.
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[0].VerticalAlignment = VerticalAlignment.Center;
            Paragraph paragraphConcept = rowHeader.Cells[0].AddParagraph();
            paragraphConcept.AddFormattedText("Order Notes", TextFormat.Bold);

            //                                              //Total cost row with formart config.
            Row row = tabEstimate.AddRow();
            Paragraph paragraphTotalCost = row.Cells[0].AddParagraph();
            paragraphTotalCost.AddFormattedText(ticmod.strWisnetNote ?? "", TextFormat.Bold);
            row.Cells[0].Format.Font.Size = 8;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateOdysseyNotesTable()
        {
            this.section.AddParagraph();
            Table tabEstimate = this.section.AddTable();
            tabEstimate.Style = "Table";
            tabEstimate.Borders.Color = Color.FromRgb(0, 0, 0);
            tabEstimate.Borders.Width = 1;

            //                                              //Create the table's cells.
            Column column = tabEstimate.AddColumn("18.8cm");
            column.Format.Alignment = ParagraphAlignment.Center;

            Row rowHeader = tabEstimate.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(255, 255, 255);
            rowHeader.Format.Font.Size = 8;
            rowHeader.Shading.Color = Color.FromRgb(0, 0, 0);

            //                                              //Concept colum and config.
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            rowHeader.Cells[0].VerticalAlignment = VerticalAlignment.Center;
            Paragraph paragraphConcept = rowHeader.Cells[0].AddParagraph();
            paragraphConcept.AddFormattedText("Odyssey Notes", TextFormat.Bold);

            //                                              //Total cost row with formart config.
            Row row = tabEstimate.AddRow();
            row.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            Paragraph paragraphTotalCost = row.Cells[0].AddParagraph();
            paragraphTotalCost.AddFormattedText(ticmod.strOdyssey2Note ?? "", TextFormat.Bold);
            row.Cells[0].Format.Font.Size = 8;
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subCreateFooter()
        {
            //Paragraph parPrice = this.section.Footers.Primary.AddTable(ticmod.numnJobPrice.GetValueOrDefault().ToString("c2"));
            //                                              //Ticket information table config.
            Table tabFooter = this.section.Footers.Primary.AddTable();
            tabFooter.Style = "Table";
            tabFooter.Borders.Color = Color.FromRgb(255, 255, 255);
            tabFooter.Borders.Width = 1;

            //                                              //Create the table columns.
            Column colTablecols = tabFooter.AddColumn("4.7cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Left;

            colTablecols = tabFooter.AddColumn("9.4cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Center;

            colTablecols = tabFooter.AddColumn("4.7cm");
            colTablecols.Format.Alignment = ParagraphAlignment.Right;


            //                                              //Add a new row for the table headers.
            Row rowHeader = tabFooter.AddRow();
            rowHeader.HeadingFormat = true;
            rowHeader.Format.Alignment = ParagraphAlignment.Center;
            rowHeader.Format.Font.Bold = true;
            rowHeader.Format.Font.Color = Color.FromRgb(185, 183, 183);
            rowHeader.Format.Font.Size = 8;

            //                                              //Price column configuration.
            Paragraph parPrice = rowHeader.Cells[0].AddParagraph();


            parPrice.AddFormattedText("Price: " + ticmod.numnJobPrice.GetValueOrDefault().ToString("c2"), 
                TextFormat.Bold);
            rowHeader.Cells[0].Format.Alignment = ParagraphAlignment.Left;

            //                                              //Date column configuration.
            Paragraph parDate = rowHeader.Cells[1].AddParagraph();
            parDate.AddFormattedText("Printed on " + DateTime.Now.DayOfWeek.ToString() + " " + 
                DateTime.Now.ToString("MM/dd/yyyy"), TextFormat.Bold);
            rowHeader.Cells[1].Format.Alignment = ParagraphAlignment.Center;

            //                                              //Page number column configuration.
            Paragraph parPagination = rowHeader.Cells[2].AddParagraph();
            //parPagination.AddFormattedText("", TextFormat.Bold);
            parPagination.AddTab();
            parPagination.AddText("Page ");
            parPagination.AddPageField();
            parPagination.AddText(" of ");
            parPagination.AddNumPagesField();
            rowHeader.Cells[2].Format.Alignment = ParagraphAlignment.Right;

        }

        //-------------------------------------------------------------------------------------------------------------
    }
}
/*END-TASK*/