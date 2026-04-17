using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace test_info_api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TestInfos",
                columns: table => new
                {
                    TestId = table.Column<string>(type: "text", nullable: false),
                    TestCode = table.Column<string>(type: "text", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    HrId = table.Column<Guid>(type: "uuid", nullable: false),
                    AptitudeModule = table.Column<bool>(type: "boolean", nullable: false),
                    VerbalModule = table.Column<bool>(type: "boolean", nullable: false),
                    InterviewModule = table.Column<bool>(type: "boolean", nullable: false),
                    CodingModule = table.Column<bool>(type: "boolean", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    ApproxStudentCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestInfos", x => x.TestId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TestInfos");
        }
    }
}
