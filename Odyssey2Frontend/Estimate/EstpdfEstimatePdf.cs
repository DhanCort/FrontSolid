/*RP. TASK ESTIMATE*/
using System;
using System.Collections.Generic;
using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Tables;
using MigraDoc.DocumentObjectModel.Shapes;
using MigraDoc.Rendering;
using System.IO;
using Odyssey2Frontend.Models;
using System.Drawing;
using Font = System.Drawing.Font;
using Color = System.Drawing.Color;
using System.Drawing.Imaging;
using Image = MigraDoc.DocumentObjectModel.Shapes.Image;
using System.Linq;


//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //DATE: July 6, 2020.

namespace Odyssey2Frontend.Estimate
{
    //==================================================================================================================
    public class EstpdfEstimatePdf
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES

        private Document document = null;
        private Section section = null;
        private Table orderForm = null;
        private Table estimate = null;
        private List<EstimateModel> darrestmod = null;

        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        public EstpdfEstimatePdf(
            List<EstimateModel> darrestmod_I
            )
        {
            this.darrestmod = darrestmod_I;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.
        public byte[] arrbyteGenerateEstimate()
        {
            this.document = new Document();

            //                                              //This functions set the values for the bullet on the
            //                                              //      estimation table.
            this.subSetStyles();

            //                                              //This functions create a image that will be the watermark, if
            //                                              //      the estimation is not completed.
            byte[] arrbyteWatermarkImage = this.arrbyteCreateWatermarkImageText();

            //                                              //This function call all the functions for each estimation
            //                                              //      on the received list.
            this.subAddSections(arrbyteWatermarkImage);

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
        private void subAddSections(
            byte[] arrbyteWatermarkImage_I
            )
        {
            foreach (EstimateModel estmod in darrestmod)
            {
                //                                          //Add a new page.
                this.section = this.document.AddSection();
                this.section.PageSetup.PageFormat = PageFormat.Letter;

                //                                          //Add the watermark if the estimate is incomplete.
                this.subPrintWaterMark(arrbyteWatermarkImage_I, estmod);

                //                                          //Add a new section (Page in blank) and set the title
                //                                          //      header.
                this.subHeader(estmod);

                //                                          //Add a table with all the order form data.
                this.subSetAnticipatedStartDate(estmod);

                //                                          //Add a table with all the order form data.
                this.subOrderFormData(estmod);

                //                                          //Add a table with all the estimation data.
                this.subEstimation(estmod);
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subHeader(EstimateModel estmod)
        {
            String strName = estmod.strName;

            if (
                //                                          //If the strName is null or empty, the name gonna be
                //                                          //      the estimate id. Example: Estimate 1.
                String.IsNullOrEmpty(strName)
                )
            {
                strName = "Estimate " + estmod.intEstimationId;
            }

            Paragraph paragraph = null;

            //                                              //Title section config.
            TextFrame textFrameTitle = section.AddTextFrame();
            textFrameTitle.Height = "3.0cm";
            textFrameTitle.Width = "14.0cm";
            textFrameTitle.Left = ShapePosition.Left;
            textFrameTitle.RelativeHorizontal = RelativeHorizontal.Margin;
            textFrameTitle.Top = "1.0cm";
            textFrameTitle.RelativeVertical = RelativeVertical.Page;

            //                                              //Title section info.
            paragraph = textFrameTitle.AddParagraph(strName + "\n\n\n\n\n");
            paragraph.Format.Font.Size = 20;
            paragraph.Format.SpaceAfter = 3;

        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subSetAnticipatedStartDate(EstimateModel estmod)
        {
            Paragraph paragraph = null;

            //                                              //Title section config.
            TextFrame textFrameTitle = section.AddTextFrame();
            textFrameTitle.Height = "3.0cm";
            textFrameTitle.Width = "7.30cm";
            textFrameTitle.Left = ShapePosition.Right;
            textFrameTitle.RelativeHorizontal = RelativeHorizontal.Margin;
            textFrameTitle.Top = "2.0cm";
            textFrameTitle.RelativeVertical = RelativeVertical.Page;

            //                                              //Title section info.
            paragraph = textFrameTitle.AddParagraph();
            paragraph.AddFormattedText("Anticipated Start Date: ", TextFormat.Bold);
            paragraph.AddFormattedText(estmod.strBaseDate + " " + estmod.strBaseTime, TextFormat.NotBold);
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subOrderFormData(EstimateModel estmod)
        {
            //                                          //Order form table's config.
            this.orderForm = this.section.AddTable();
            this.orderForm.Style = "Table";
            this.orderForm.Borders.Color = MigraDoc.DocumentObjectModel.Color.FromRgb(7, 12, 51);
            this.orderForm.Borders.Width = 1;
            this.orderForm.Borders.Left.Width = 1;
            this.orderForm.Borders.Right.Width = 1;
            this.orderForm.Rows.LeftIndent = 0;

            //                                              //Create the table's cells.
            Column column = this.orderForm.AddColumn("5.0cm");
            column.Format.Alignment = ParagraphAlignment.Center;

            column = this.orderForm.AddColumn("5.3cm");
            column.Format.Alignment = ParagraphAlignment.Right;

            column = this.orderForm.AddColumn("6.5cm");
            column.Format.Alignment = ParagraphAlignment.Right;

            //                                              //Add a new row for the job data.
            Row row = orderForm.AddRow();
            row.HeadingFormat = true;
            row.Format.Alignment = ParagraphAlignment.Center;
            row.Format.Font.Bold = true;
            row.Shading.Color = MigraDoc.DocumentObjectModel.Color.FromRgb(255, 255, 255);

            //                                              //Config and colum Jobid.
            Paragraph paragraphJob = row.Cells[0].AddParagraph();
            paragraphJob.AddFormattedText("Job Number: ", TextFormat.Bold);
            paragraphJob.AddFormattedText(estmod.strJobNumber ?? "-", TextFormat.NotBold);
            row.Cells[0].Format.Font.Bold = false;
            row.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            row.Cells[0].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Config and colum JobName.
            Paragraph paragraphName = row.Cells[1].AddParagraph();
            paragraphName.AddFormattedText("Category: ", TextFormat.Bold);
            paragraphName.AddFormattedText(estmod.strProductCategory, TextFormat.NotBold);
            row.Cells[1].Format.Font.Bold = false;
            row.Cells[1].Format.Alignment = ParagraphAlignment.Left;
            row.Cells[1].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Config and colum JobType.
            Paragraph paragraphProductType = row.Cells[2].AddParagraph();
            paragraphProductType.AddFormattedText("Delivery Date: ", TextFormat.Bold);
            paragraphProductType.AddFormattedText(estmod.strDeliveryDate + " " + estmod.strDeliveryTime, TextFormat.NotBold);
            row.Cells[2].Format.Font.Bold = false;
            row.Cells[2].Format.Alignment = ParagraphAlignment.Left;
            row.Cells[2].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Add a new row for the order form options.
            row = orderForm.AddRow();

            //                                              //Config and colum for order form options.
            row.Cells[0].Format.Font.Bold = false;
            row.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            row.Cells[0].VerticalAlignment = VerticalAlignment.Center;
            row.Cells[0].MergeRight = 2;

            //                                              //Order form title.
            Paragraph paragraphOrderForm = row.Cells[0].AddParagraph();
            paragraphOrderForm.AddFormattedText("Job Specs", TextFormat.Bold);

            //                                              //Define a list that contains the order form options.
            ListInfo listInfo = new ListInfo();
            listInfo.ContinuePreviousList = true;
            listInfo.ListType = ListType.BulletList1;

            //                                              //Set each order form value of the job.
            paragraphOrderForm = row.Cells[0].AddParagraph("Quantity: " + estmod.intnQuantity.GetValueOrDefault());
            paragraphOrderForm.Style = "Bullet";
            paragraphOrderForm.Format.ListInfo = listInfo;

            //                                              //Set Data on list.
            if (
                estmod.arrattr != null
                )
            {
                foreach (EstimateOrderFormAttributesModel item in estmod.arrattr)
                {
                    //                                          //List bullet config. ListInfo object must be initialized 
                    //                                          //      for ecah row.
                    listInfo = new ListInfo();
                    listInfo.ContinuePreviousList = true;
                    listInfo.ListType = ListType.BulletList1;

                    //                                          //Set each order form value of the job.
                    paragraphOrderForm = row.Cells[0].AddParagraph(item.strAttributeName + ": " + item.strValue);
                    paragraphOrderForm.Style = "Bullet";
                    paragraphOrderForm.Format.ListInfo = listInfo;
                }
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subEstimation(EstimateModel estmod)
        {
            this.section.AddParagraph();
            this.estimate = this.section.AddTable();
            this.estimate.Style = "Table";
            this.estimate.Borders.Color = MigraDoc.DocumentObjectModel.Color.FromRgb(7, 12, 51);
            this.estimate.Borders.Width = 1;
            this.estimate.Borders.Left.Width = 1;
            this.estimate.Borders.Right.Width = 1;
            this.estimate.Rows.LeftIndent = 0;

            //                                              //Create the table's cells.
            Column column = this.estimate.AddColumn("9.5cm");
            column.Format.Alignment = ParagraphAlignment.Center;

            column = this.estimate.AddColumn("3.3cm");
            column.Format.Alignment = ParagraphAlignment.Right;

            column = this.estimate.AddColumn("0.5cm");
            column.Format.Alignment = ParagraphAlignment.Right;
            column.Borders.Right.Visible = false;

            column = this.estimate.AddColumn("3.5cm");
            column.Format.Alignment = ParagraphAlignment.Right;
            column.Borders.Left.Visible = false;

            Row row = this.estimate.AddRow();

            //                                              //Concept colum and config.
            row.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            row.Cells[0].VerticalAlignment = VerticalAlignment.Center;
            Paragraph paragraphConcept = row.Cells[0].AddParagraph();
            paragraphConcept.AddFormattedText("Concept", TextFormat.Bold);

            //                                              //Quantity colum and config.
            row.Cells[1].Format.Alignment = ParagraphAlignment.Center;
            row.Cells[1].VerticalAlignment = VerticalAlignment.Center;
            Paragraph paragraphQuantity = row.Cells[1].AddParagraph();
            paragraphQuantity.AddFormattedText("Quantity", TextFormat.Bold);

            //                                              //Cost colum and config.
            row.Cells[2].Format.Alignment = ParagraphAlignment.Center;
            row.Cells[2].VerticalAlignment = VerticalAlignment.Center;
            row.Cells[2].MergeRight = 1;
            Paragraph paragraphCost = row.Cells[2].AddParagraph();
            paragraphCost.AddFormattedText("Cost", TextFormat.Bold);

            //                                              //Price colum and config.
            //Paragraph paragraphPrice = row.Cells[3].AddParagraph();
            //paragraphPrice.AddFormattedText("Price", TextFormat.Bold);
            //row.Cells[3].Format.Font.Bold = false;
            //row.Cells[3].Format.Alignment = ParagraphAlignment.Center;
            //row.Cells[3].VerticalAlignment = VerticalAlignment.Center;

            //                                              //Function to add the product name.
            subAddProductRow(row, estmod);

            //                                              //Function to add the calculation' rows.
            subAddCalculationRows(row, "BulletLevel2", estmod.arrcal);

            //                                              //Function to add the process' rows.
            subAddProcessRows(row, estmod);

            //                                              //Function to add the total' rows.
            subAddTotalRows(row, estmod);
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddProductRow(Row row, EstimateModel estmod)
        {
            //                                              //Add product name on concept column.
            row = estimate.AddRow();
            row.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            row.Cells[0].VerticalAlignment = VerticalAlignment.Center;
            Paragraph paragraphProduct = row.Cells[0].AddParagraph();
            paragraphProduct.AddFormattedText("Product: ", TextFormat.Bold);
            paragraphProduct.AddFormattedText(estmod.strProductName, TextFormat.NotBold);
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddCalculationRows(Row row, String strBulletLevel, List<EstimateCalculationModel> darrrcal)
        {
            //                                              //Add calculations and their costs.
            foreach (var item in darrrcal)
            {
                row = estimate.AddRow();
                Paragraph paragraphCalculationDescription = row.Cells[0].AddParagraph(item.strDescription);
                paragraphCalculationDescription.Style = strBulletLevel;
                row.Cells[2].AddParagraph("$");
                row.Cells[3].AddParagraph(item.numCost.ToString("n2"));
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddProcessRows(Row row, EstimateModel estmod)
        {
            //                                              //Add processes and their costs.
            row = estimate.AddRow();
            Paragraph paragraphProcesses = row.Cells[0].AddParagraph();
            paragraphProcesses.AddFormattedText("Processes:", TextFormat.Bold);
            paragraphProcesses.Style = "BulletLevel2";

            foreach (var item in estmod.arrpro)
            {
                row = estimate.AddRow();
                Paragraph paragraphProcessDescription = row.Cells[0].AddParagraph(item.strName);
                paragraphProcessDescription.Style = "BulletLevel3";

                subAddCalculationRows(row, "BulletLevel4", item.arrcal);
                subAddResourceRows(row, item.arrres);
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddResourceRows(Row row, List<EstimateResourcesModel> darrres)
        {
            //                                              //Add Resources and their costs.
            row = estimate.AddRow();
            Paragraph paragraphProcesses = row.Cells[0].AddParagraph();
            paragraphProcesses.AddFormattedText("Resources:", TextFormat.Bold);
            paragraphProcesses.Style = "BulletLevel4";

            foreach (EstimateResourcesModel item in darrres)
            {
                row = estimate.AddRow();
                Paragraph paragraphProcessDescription = row.Cells[0].AddParagraph(item.strName ?? "");
                paragraphProcessDescription.Style = "BulletLevel5";

                row.Cells[1].AddParagraph(item.numQuantity + " " + item.strUnit);
                row.Cells[1].Format.Alignment = ParagraphAlignment.Center;
                row.Cells[2].AddParagraph("$");
                row.Cells[3].AddParagraph(item.numCost.ToString("n2"));

                //if (
                //    this.boolIsCompleted && !item.boolIsCompleted
                //    )
                //{
                //    this.boolIsCompleted = item.boolIsCompleted;
                //}
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        public void subAddTotalRows(Row row, EstimateModel estmod)
        {
            //                                              //Total cost row with formart config.
            row = estimate.AddRow();
            Paragraph paragraphTotalCost = row.Cells[1].AddParagraph();
            paragraphTotalCost.AddFormattedText("Total Cost:", TextFormat.Bold);
            row.Cells[1].Format.Alignment = ParagraphAlignment.Center;

            row.Cells[2].AddParagraph("$");
            row.Cells[3].AddParagraph(estmod.numnJobEstimateCost.GetValueOrDefault().ToString("n2"));

            //                                              //Total price row with formart config.
            row = estimate.AddRow();
            Paragraph paragraphTotalPrice = row.Cells[1].AddParagraph();
            paragraphTotalPrice.AddFormattedText("Total Price:", TextFormat.Bold);
            row.Cells[1].Format.Alignment = ParagraphAlignment.Center;

            row.Cells[2].AddParagraph("$");
            row.Cells[3].AddParagraph(estmod.numnJobEstimatePrice.GetValueOrDefault().ToString("n2"));
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private byte[] arrbyteCreateWatermarkImageText()
        {
            //                                              //Create a font instance.
            Font font = new Font("Arial", 40);

            //                                              //Create a new instance with de final width and heigth.
            Bitmap bitmap = new Bitmap(340, 500);
            Graphics graphics = Graphics.FromImage(bitmap);

            //                                              //Set the backgruod color on white.
            graphics.Clear(Color.FromArgb(255, 255, 255));

            graphics.RotateTransform(50);

            //                                              //Create a bruch with red color.
            Brush textBrush = new SolidBrush(Color.FromArgb(255, 147, 147));

            //                                              //Draw the image an save.
            graphics.DrawString("Incomplete estimate", font, textBrush, 50, 0);
            graphics.Save();

            //                                              //Convert the bitmap into array byte.
            byte[] arrbyteWatermarkImage = null;
            using (MemoryStream stream = new MemoryStream())
            {
                bitmap.Save(stream, ImageFormat.Png);
                arrbyteWatermarkImage = stream.ToArray();
            }

            //                                              //Return the image.
            return arrbyteWatermarkImage;
        }


        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subPrintWaterMark(
            byte[] arrbyteWatermarkImage_I,
            EstimateModel estmod_I
            )
        {

            if (
                //                                          //Verify the resources and find the incomplete ones.
                boolIsIncompleted(estmod_I)
                )
            {
                Image imageWaterMarkSection = this.section
                    .AddImage("base64:" + Convert.ToBase64String(arrbyteWatermarkImage_I));

                imageWaterMarkSection.Height = Unit.FromCentimeter(17);
                imageWaterMarkSection.LockAspectRatio = true;
                imageWaterMarkSection.Top = MigraDoc.DocumentObjectModel.Shapes.ShapePosition.Center;
                imageWaterMarkSection.Left = MigraDoc.DocumentObjectModel.Shapes.ShapePosition.Center;

                imageWaterMarkSection.RelativeHorizontal = MigraDoc.DocumentObjectModel.Shapes.RelativeHorizontal.Margin;
                imageWaterMarkSection.RelativeVertical = MigraDoc.DocumentObjectModel.Shapes.RelativeVertical.Margin;
                imageWaterMarkSection.WrapFormat.Style = MigraDoc.DocumentObjectModel.Shapes.WrapStyle.None;
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private bool boolIsIncompleted(
            EstimateModel estmod_I
            )
        {
            bool boolIsIncompleted = false;

            if (
                //                                          //If the arrays contains values
                estmod_I != null && estmod_I.arrpro != null
                )
            {
                int intIndex = 0;
                while (
                    //                                      //While index values be less than process array rows and
                    //                                      //      boolIsIncompletes be diferent from true
                    intIndex < estmod_I.arrpro.Count && boolIsIncompleted != true
                    )
                {
                    //                                      //Search if some resource isn't complete.
                    boolIsIncompleted = estmod_I.arrpro[intIndex].arrres.Select(res => res)
                        .Where(res => res.boolIsCompleted == false).Count() > 0 ? true : false;

                    intIndex = intIndex + 1;
                }
            }
            else
            {
                boolIsIncompleted = true;
            }

            return boolIsIncompleted;
        }

    }

    //==================================================================================================================
}
/*END-TASK*/
