using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Sheets.Model;

namespace Tasks.Model{

    public partial class TodoContext : DbContext
    {
        public TodoContext()
        {
        }

        public TodoContext(DbContextOptions<TodoContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Todo> Todos { get; set; }
        public virtual DbSet<Sheet> Sheets { get; set; }

    //     protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    // #warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
    //         => optionsBuilder.UseMySQL("server=localhost;database=todo;user=root;password=root");

        // protected override void OnModelCreating(ModelBuilder modelBuilder)
        // {
        //     modelBuilder.Entity<Todo>(entity =>
        //     {
        //         entity.HasKey(e => e.Id).HasName("PRIMARY");

        //         entity.ToTable("todo");

        //         entity.Property(e => e.Name).HasMaxLength(45);
        //     });

        //     OnModelCreatingPartial(modelBuilder);
        // }

        // partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}

