using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace mapping_api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TestMappings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TestId = table.Column<string>(type: "text", nullable: false),
                    TestCode = table.Column<string>(type: "text", nullable: false),
                    CompanyId = table.Column<string>(type: "text", nullable: false),
                    HrId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestMappings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AiInterviewMappings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TestMappingId = table.Column<int>(type: "integer", nullable: false),
                    AiInterviewCode = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiInterviewMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiInterviewMappings_TestMappings_TestMappingId",
                        column: x => x.TestMappingId,
                        principalTable: "TestMappings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AptitudeMappings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TestMappingId = table.Column<int>(type: "integer", nullable: false),
                    AptitudeCode = table.Column<string>(type: "text", nullable: false),
                    NoOfQuestions = table.Column<int>(type: "integer", nullable: false),
                    Topics = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AptitudeMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AptitudeMappings_TestMappings_TestMappingId",
                        column: x => x.TestMappingId,
                        principalTable: "TestMappings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodingMappings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TestMappingId = table.Column<int>(type: "integer", nullable: false),
                    ProblemCodes = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodingMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodingMappings_TestMappings_TestMappingId",
                        column: x => x.TestMappingId,
                        principalTable: "TestMappings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VerbalMappings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TestMappingId = table.Column<int>(type: "integer", nullable: false),
                    VerbalCode = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VerbalMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VerbalMappings_TestMappings_TestMappingId",
                        column: x => x.TestMappingId,
                        principalTable: "TestMappings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiInterviewMappings_TestMappingId",
                table: "AiInterviewMappings",
                column: "TestMappingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AptitudeMappings_TestMappingId",
                table: "AptitudeMappings",
                column: "TestMappingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CodingMappings_TestMappingId",
                table: "CodingMappings",
                column: "TestMappingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VerbalMappings_TestMappingId",
                table: "VerbalMappings",
                column: "TestMappingId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiInterviewMappings");

            migrationBuilder.DropTable(
                name: "AptitudeMappings");

            migrationBuilder.DropTable(
                name: "CodingMappings");

            migrationBuilder.DropTable(
                name: "VerbalMappings");

            migrationBuilder.DropTable(
                name: "TestMappings");
        }
    }
}
