/*RP. TASK Data*/
using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Shapes;
using MigraDoc.DocumentObjectModel.Tables;
using MigraDoc.Rendering;
using Odyssey2Frontend.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

//                                                          //AUTHOR: Towa (AQG - Andrea Quiroz).
//                                                          //CO-AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: September 17, 2020.

namespace Odyssey2Frontend.Job
{
    //==================================================================================================================
    public class CuspdfCustomerPdf
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES

        private Document document = null;
        private Section section = null;
        private Table jobs = null;
        private List<PrintshopCustomerModel> darrcustomersmodel = null;
        private List<ReportModel> darrcolJobs = null;

        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //-------------------------------------------------------------------------------------------------------------
        public CuspdfCustomerPdf(
            List<PrintshopCustomerModel> darrcustomersmodel_I,
            List<ReportModel> darrcolJobs_I
            )
        {
            this.darrcustomersmodel = darrcustomersmodel_I;
            this.darrcolJobs = darrcolJobs_I;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.
        public byte[] GeneratePdf(
            )
        {
            this.document = new Document();
            this.document.DefaultPageSetup.LeftMargin = 20;
            this.document.DefaultPageSetup.RightMargin = 15;

            //                                              //This functions set the values for the bullet on the
            //                                              //      estimation table.
            this.subSetStyles();

            //                                              //This function call all the functions for each estimation
            //                                              //      on the received list.
            this.subAddSection();

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
            style = this.document.AddStyle("Bullet", "Normal");
            style.ParagraphFormat.LeftIndent = "0.5cm";
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddSection(
            )
        {
            //                                              //Add a new page.
            this.section = this.document.AddSection();
            this.section.PageSetup.PageFormat = PageFormat.Letter;

            //                                          //Add a table with all the estimation data.
            this.subAddCustomers();
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddCustomers(
            )
        {
            //                                              //Title section config.
            TextFrame textFrameTitle = section.AddTextFrame();
            textFrameTitle.Height = "3.0cm";
            textFrameTitle.Width = "14.0cm";
            textFrameTitle.Left = ShapePosition.Left;
            textFrameTitle.RelativeHorizontal = RelativeHorizontal.Margin;
            textFrameTitle.Top = "1.0cm";
            textFrameTitle.RelativeVertical = RelativeVertical.Page;

            //                                              //Title section info.
            String strTitle = "Customers";

            Paragraph paragraph = textFrameTitle.AddParagraph(strTitle);
            paragraph.Format.Font.Size = 20;
            paragraph.Format.SpaceAfter = 3;

            //                                              //Create the table.
            this.section.AddParagraph("\n");
            this.jobs = this.section.AddTable();

            //                                              //Set the style.
            this.jobs.Style = "Table";
            this.jobs.Borders.Color = MigraDoc.DocumentObjectModel.Color.FromRgb(7, 12, 51);
            this.jobs.Borders.Width = 1;
            this.jobs.Borders.Left.Width = 1;
            this.jobs.Borders.Right.Width = 1;
            this.jobs.Rows.LeftIndent = 0;

            //                                              //Column dimensions.
            double numFirstNameDimensions = 2.8;
            double numLastNameDimensions = 2.8;
            double numCompanyDimensions = 3;
            double numPhoneDimensions = 2.7;
            double numCellPhoneDimensions = 2.7;
            double numEmailDimensions = 5.7;

            //                                              //Get final dimensions considering the columns to show.
            this.subGetFinalDimensions(ref numFirstNameDimensions, ref numLastNameDimensions, ref numCompanyDimensions,
                ref numPhoneDimensions, ref numCellPhoneDimensions, ref numEmailDimensions);

            //                                              //Add columns.
            this.subAddColumns();

            //                                              //First row.
            this.subAddFirstRow();

            foreach (PrintshopCustomerModel customermodel in darrcustomersmodel)
            {
                //                                          //Function to add the customer.
                this.subAddJobRow(customermodel);
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subGetFinalDimensions(
            ref double numFirstNameDimensions_IO, 
            ref double numLastNameDimensions_IO, 
            ref double numCompanyDimensions_IO,
            ref double numPhoneDimensions_IO,
            ref double numCellPhoneDimensions_IO,
            ref double numEmailDimensions_IO
            )
        {
            foreach(ReportModel reportmodel in this.darrcolJobs)
            {
                /*CASE*/
                if (
                    reportmodel.field == "strFirstName"
                    )
                {
                    reportmodel.numDimensions = numFirstNameDimensions_IO;
                }
                else if (
                    reportmodel.field == "strLastName"
                    )
                {
                    reportmodel.numDimensions = numLastNameDimensions_IO;
                }
                else if (
                    reportmodel.field == "strCompanyName"
                    )
                {
                    reportmodel.numDimensions = numCompanyDimensions_IO;
                }
                else if (
                    reportmodel.field == "strPhone"
                    )
                {
                    reportmodel.numDimensions = numPhoneDimensions_IO;
                }
                else if (
                    reportmodel.field == "strCellPhone"
                    )
                {
                    reportmodel.numDimensions = numCellPhoneDimensions_IO;
                }
                else if (
                    reportmodel.field == "strEmail"
                    )
                {
                    reportmodel.numDimensions = numEmailDimensions_IO;
                }
                /*END-CASE*/
            }

            if (
                !this.darrcolJobs.Exists(c => c.field == "strFirstName")
                )
            {
                double numDimensionsDivided = numFirstNameDimensions_IO / this.darrcolJobs.Count;

                foreach(ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }
            
            if (
                !this.darrcolJobs.Exists(c => c.field == "strLastName")
                )
            {
                double numDimensionsDivided = numLastNameDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }
            
            if (
                !this.darrcolJobs.Exists(c => c.field == "strCompanyName")
                )
            {
                double numDimensionsDivided = numCompanyDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }

            if (
                !this.darrcolJobs.Exists(c => c.field == "strPhone")
                )
            {
                double numDimensionsDivided = numPhoneDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }
            
            if (
                !this.darrcolJobs.Exists(c => c.field == "strCellPhone")
                )
            {
                double numDimensionsDivided = numCellPhoneDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }

            if (
                !this.darrcolJobs.Exists(c => c.field == "strEmail")
                )
            {
                double numDimensionsDivided = numEmailDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddColumns(
            )
        {
            foreach(ReportModel reportmodel in this.darrcolJobs)
            {
                Column column = this.jobs.AddColumn(Math.Round(reportmodel.numDimensions, 1) + "cm");
                column.Format.Alignment = ParagraphAlignment.Center;
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddFirstRow(
            )
        {
            Row row = this.jobs.AddRow();

            for(int intI = 0; intI < this.darrcolJobs.Count; intI++)
            {
                ReportModel reportmodel = this.darrcolJobs[intI];

                row.Cells[intI].Format.Alignment = ParagraphAlignment.Center;
                row.Cells[intI].VerticalAlignment = VerticalAlignment.Center;
                Paragraph paragraph = row.Cells[intI].AddParagraph();
                paragraph.AddFormattedText(reportmodel.title);
                paragraph.Format.Font.Size = 8;
                paragraph.Format.Font.Bold = true;
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddJobRow(
            PrintshopCustomerModel customermodel_I
            )
        {
            Row row = this.jobs.AddRow();
            for (int intI = 0; intI < this.darrcolJobs.Count; intI++)
            {
                ReportModel reportmodel = this.darrcolJobs[intI];

                row.Cells[intI].Format.Alignment = ParagraphAlignment.Left;
                row.Cells[intI].VerticalAlignment = VerticalAlignment.Center;
                Paragraph paragraph = row.Cells[intI].AddParagraph();

                /*CASE*/
                if (
                    reportmodel.field == "strFirstName"
                    )
                {
                    //                                          //First name.
                    paragraph.AddFormattedText(customermodel_I.strFirstName ?? "");
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "strLastName"
                    )
                {
                    //                                          //Last Name.
                    row.Cells[intI].Format.Alignment = ParagraphAlignment.Left;
                    paragraph.AddFormattedText(customermodel_I.strLastName ?? "");
                    paragraph.Format.Font.Size = 7;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "strCompanyName"
                    )
                {
                    //                                          //Company name.
                    row.Cells[intI].Format.Alignment = ParagraphAlignment.Left;
                    paragraph.AddFormattedText(customermodel_I.strCompanyName ?? "");
                    paragraph.Format.Font.Size = 7;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "strPhone"
                    )
                {
                    //                                          //Phone number.
                    paragraph.AddFormattedText(customermodel_I.strPhone ?? "");
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "strCellPhone"
                    )
                {
                    //                                          //Phone number.
                    paragraph.AddFormattedText(customermodel_I.strCellPhone ?? "");
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "strEmail"
                    )
                {
                    //                                          //Email.
                    paragraph.AddFormattedText(customermodel_I.strEmail ?? "");
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
            }
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
