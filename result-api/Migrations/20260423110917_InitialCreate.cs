using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace result_api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Results",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<string>(type: "text", nullable: false),
                    TestId = table.Column<string>(type: "text", nullable: false),
                    TestCode = table.Column<string>(type: "text", nullable: false),
                    CompanyId = table.Column<string>(type: "text", nullable: false),
                    HrId = table.Column<string>(type: "text", nullable: false),
                    TotalScore = table.Column<double>(type: "double precision", nullable: false),
                    ScoreSecured = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Results", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AiInterviewResult",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResultBaseId = table.Column<int>(type: "integer", nullable: false),
                    AiCode = table.Column<string>(type: "text", nullable: false),
                    ModuleTotalScore = table.Column<double>(type: "double precision", nullable: false),
                    ModuleScoreSecured = table.Column<double>(type: "double precision", nullable: false),
                    Questions = table.Column<List<string>>(type: "jsonb", nullable: false),
                    Answers = table.Column<List<string>>(type: "jsonb", nullable: false),
                    CorrectAnswers = table.Column<List<string>>(type: "jsonb", nullable: false),
                    Correct = table.Column<int>(type: "integer", nullable: false),
                    Wrong = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiInterviewResult", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiInterviewResult_Results_ResultBaseId",
                        column: x => x.ResultBaseId,
                        principalTable: "Results",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AptitudeResult",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResultBaseId = table.Column<int>(type: "integer", nullable: false),
                    AptitudeCode = table.Column<string>(type: "text", nullable: false),
                    ModuleTotalScore = table.Column<double>(type: "double precision", nullable: false),
                    ModuleScoreSecured = table.Column<double>(type: "double precision", nullable: false),
                    Questions = table.Column<List<string>>(type: "jsonb", nullable: false),
                    UserAnswers = table.Column<List<string>>(type: "jsonb", nullable: false),
                    CorrectAnswers = table.Column<List<string>>(type: "jsonb", nullable: false),
                    Topics = table.Column<List<string>>(type: "jsonb", nullable: false),
                    Correct = table.Column<int>(type: "integer", nullable: false),
                    Incorrect = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AptitudeResult", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AptitudeResult_Results_ResultBaseId",
                        column: x => x.ResultBaseId,
                        principalTable: "Results",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodingResult",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResultBaseId = table.Column<int>(type: "integer", nullable: false),
                    CodingCode = table.Column<string>(type: "text", nullable: false),
                    ModuleTotalScore = table.Column<double>(type: "double precision", nullable: false),
                    ModuleScoreSecured = table.Column<double>(type: "double precision", nullable: false),
                    TestcaseTotals = table.Column<List<int>>(type: "jsonb", nullable: false),
                    TestcasePassed = table.Column<List<int>>(type: "jsonb", nullable: false),
                    Answers = table.Column<List<string>>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodingResult", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodingResult_Results_ResultBaseId",
                        column: x => x.ResultBaseId,
                        principalTable: "Results",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VerbalResult",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResultBaseId = table.Column<int>(type: "integer", nullable: false),
                    VerbalCode = table.Column<string>(type: "text", nullable: false),
                    ModuleTotalScore = table.Column<double>(type: "double precision", nullable: false),
                    ModuleScoreSecured = table.Column<double>(type: "double precision", nullable: false),
                    Metrics = table.Column<Dictionary<string, double>>(type: "jsonb", nullable: false),
                    Listening = table.Column<List<string>>(type: "jsonb", nullable: false),
                    Speaking = table.Column<List<string>>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VerbalResult", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VerbalResult_Results_ResultBaseId",
                        column: x => x.ResultBaseId,
                        principalTable: "Results",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiInterviewResult_ResultBaseId",
                table: "AiInterviewResult",
                column: "ResultBaseId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AptitudeResult_ResultBaseId",
                table: "AptitudeResult",
                column: "ResultBaseId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CodingResult_ResultBaseId",
                table: "CodingResult",
                column: "ResultBaseId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VerbalResult_ResultBaseId",
                table: "VerbalResult",
                column: "ResultBaseId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiInterviewResult");

            migrationBuilder.DropTable(
                name: "AptitudeResult");

            migrationBuilder.DropTable(
                name: "CodingResult");

            migrationBuilder.DropTable(
                name: "VerbalResult");

            migrationBuilder.DropTable(
                name: "Results");
        }
    }
}
