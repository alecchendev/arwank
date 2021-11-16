use anchor_lang::prelude::*;

declare_id!("4drqYMg65f9Rwy8fZPFqZY8EKT5vASG9UDShizaym9MS");

#[program]
pub mod arwank {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, base_account_bump: u8) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.data = String::from("");
        base_account.bump = base_account_bump;
        Ok(())
    }

    pub fn set_pointer(ctx: Context<SetPointer>, data: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.data = data;
        Ok(())
    }

    pub fn publish(ctx: Context<Publish>, story_account_bump: u8, story_pointer: String, contrib_pointer: String, new_data: String) -> ProgramResult {
        let story_account = &mut ctx.accounts.story_account;
        story_account.pointer = contrib_pointer;
        story_account.bump = story_account_bump;
        let base_account = &mut ctx.accounts.base_account;
        base_account.data = new_data;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(base_account_bump: u8)]
pub struct Initialize<'info> {
    #[account(init, seeds = [b"base_account".as_ref()], bump = base_account_bump, payer = user, space = 512)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}

#[derive(Accounts)]
pub struct SetPointer<'info> {
    #[account(mut, seeds = [b"base_account".as_ref()], bump = base_account.bump)]
    pub base_account: Account<'info, BaseAccount>,
}


#[account]
pub struct BaseAccount {
    pub data: String,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(story_account_bump: u8, story_pointer: String)]
pub struct Publish<'info> {
    #[account(init, seeds = [story_pointer.as_bytes()], bump = story_account_bump, payer = user, space = 512)]
    pub story_account: Account<'info, StoryAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
    #[account(mut, seeds = [b"base_account".as_ref()], bump = base_account.bump)]
    pub base_account: Account<'info, BaseAccount>,
}

#[account]
pub struct StoryAccount {
    pub pointer: String,
    pub bump: u8,
}