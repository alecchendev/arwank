use anchor_lang::prelude::*;

declare_id!("4drqYMg65f9Rwy8fZPFqZY8EKT5vASG9UDShizaym9MS");

#[program]
pub mod arwank {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.data = String::from("");
        Ok(())
    }

    pub fn set_pointer(ctx: Context<SetPointer>, data: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.data = data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 512)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}

#[derive(Accounts)]
pub struct SetPointer<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

#[account]
pub struct BaseAccount {
    pub data: String,
}